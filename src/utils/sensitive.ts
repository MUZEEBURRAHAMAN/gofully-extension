/**
 * Finds sensitive-looking text in OCR output (emails, phone numbers, card
 * numbers, national IDs, IPs, API keys, IBANs) so the editor can propose
 * redaction boxes. Pure functions only — no DOM, no network — so it is cheap to
 * test and everything stays on-device.
 */

export interface OcrWord {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** index of the text line this word was read on */
  line: number;
}

export type SensitiveKind = "email" | "card" | "phone" | "ssn" | "ip" | "key" | "iban";

export interface SensitiveHit {
  kind: SensitiveKind;
  /** indices into the words array */
  words: number[];
}

export const ALL_KINDS: SensitiveKind[] = ["email", "card", "phone", "ssn", "ip", "key", "iban"];

function luhn(digits: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function ibanValid(raw: string): boolean {
  const s = raw.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  let rem = 0;
  for (const ch of rearranged) {
    const v = ch >= "A" ? ch.charCodeAt(0) - 55 : ch.charCodeAt(0) - 48;
    rem = Number(`${rem}${v}`) % 97;
  }
  return rem === 1;
}

interface Rule { kind: SensitiveKind; re: RegExp; accept?: (m: string) => boolean }

const RULES: Rule[] = [
  { kind: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  {
    kind: "key",
    re: /\b(?:sk|pk|rk)[-_](?:live|test)?[-_]?[A-Za-z0-9]{16,}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bAKIA[0-9A-Z]{16}\b|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\b|\bxox[baprs]-[A-Za-z0-9-]{10,}\b|\bAIza[0-9A-Za-z_-]{30,}\b/g,
  },
  { kind: "iban", re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,4})?\b/g, accept: ibanValid },
  { kind: "ssn", re: /\b\d{3}-\d{2}-\d{4}\b/g },
  {
    kind: "ip",
    re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    accept: (m) => m.split(".").every((o) => Number(o) <= 255),
  },
  {
    kind: "card",
    re: /\b(?:\d[ -]?){12,18}\d\b/g,
    accept: (m) => {
      const digits = m.replace(/\D/g, "");
      return digits.length >= 13 && digits.length <= 19 && luhn(digits);
    },
  },
  {
    kind: "phone",
    re: /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\d{2,4}[\s.-])\d{3,4}[\s.-]?\d{3,4}\b/g,
    accept: (m) => {
      const digits = m.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 15;
    },
  },
];

/**
 * Words are joined per line with single spaces; matches are mapped back to the
 * words they cover. A character range claimed by an earlier (more specific)
 * rule is not claimed again, so a card number is never also reported as a phone.
 */
export function findSensitive(words: OcrWord[], kinds: SensitiveKind[] = ALL_KINDS): SensitiveHit[] {
  const hits: SensitiveHit[] = [];
  const byLine = new Map<number, number[]>();
  words.forEach((w, i) => {
    if (!w.text || !w.text.trim()) return;
    const arr = byLine.get(w.line) ?? [];
    arr.push(i);
    byLine.set(w.line, arr);
  });

  for (const idxs of byLine.values()) {
    let text = "";
    const spans: { start: number; end: number; wi: number }[] = [];
    for (const wi of idxs) {
      if (text) text += " ";
      const start = text.length;
      text += words[wi].text.trim();
      spans.push({ start, end: text.length, wi });
    }
    const claimed: boolean[] = new Array(text.length).fill(false);

    for (const rule of RULES) {
      if (!kinds.includes(rule.kind)) continue;
      rule.re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.re.exec(text))) {
        const start = m.index;
        const end = start + m[0].length;
        if (m[0].length === 0) { rule.re.lastIndex++; continue; }
        if (claimed.slice(start, end).some(Boolean)) continue;
        if (rule.accept && !rule.accept(m[0])) continue;
        const covered = spans.filter((s) => s.start < end && s.end > start).map((s) => s.wi);
        if (!covered.length) continue;
        for (let k = start; k < end; k++) claimed[k] = true;
        hits.push({ kind: rule.kind, words: covered });
      }
    }
  }
  return hits;
}

/** One padded box per hit (union of its words), in the OCR image's pixel space. */
export function hitBoxes(words: OcrWord[], hits: SensitiveHit[], pad = 3): { x: number; y: number; w: number; h: number; kind: SensitiveKind }[] {
  return hits.map((h) => {
    const ws = h.words.map((i) => words[i]);
    const x0 = Math.min(...ws.map((w) => w.x0)) - pad;
    const y0 = Math.min(...ws.map((w) => w.y0)) - pad;
    const x1 = Math.max(...ws.map((w) => w.x1)) + pad;
    const y1 = Math.max(...ws.map((w) => w.y1)) + pad;
    return { x: Math.max(0, x0), y: Math.max(0, y0), w: x1 - Math.max(0, x0), h: y1 - Math.max(0, y0), kind: h.kind };
  });
}
