/**
 * Turns a decoded QR or barcode value into something safe to show. Kept apart from codes.ts so on-page
 * scripts can use it without bundling the decoder.
 */

/** Matches FoundCode in codes.ts; repeated here so this file has no imports. */
export interface DecodedCode {
  format: string;
  value: string;
}

export type CodeKind = "link" | "email" | "phone" | "wifi" | "text";

/** What a decoded value is, in words people recognise. */
export function codeKind(value: string): CodeKind {
  if (safeLink(value)) return "link";
  if (/^mailto:/i.test(value)) return "email";
  if (/^tel:/i.test(value)) return "phone";
  if (/^WIFI:/i.test(value)) return "wifi";
  return "text";
}

/** An http(s) address that is safe to open, or null. Anything else (javascript:, data:, file:) is never a link. */
export function safeLink(value: string): string | null {
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

export const CODE_LABEL: Record<CodeKind, string> = {
  link: "Link",
  email: "Email address",
  phone: "Phone number",
  wifi: "Wi-Fi network",
  text: "Text",
};
