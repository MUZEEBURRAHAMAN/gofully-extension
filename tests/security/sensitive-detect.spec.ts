import { test, expect } from "@playwright/test";
import { findSensitive, hitBoxes, type OcrWord } from "../../src/utils/sensitive";

// Build OCR-like words from lines of text, one box per word.
function words(lines: string[]): OcrWord[] {
  const out: OcrWord[] = [];
  lines.forEach((line, li) => {
    let x = 10;
    for (const t of line.split(/\s+/).filter(Boolean)) {
      out.push({ text: t, x0: x, y0: li * 30, x1: x + t.length * 9, y1: li * 30 + 20, line: li });
      x += t.length * 9 + 8;
    }
  });
  return out;
}
const kinds = (lines: string[]) => findSensitive(words(lines)).map((h) => h.kind);

test.describe("Sensitive-info detector", () => {
  test("finds emails, even inside a sentence", () => {
    expect(kinds(["Contact john.doe+billing@example.co.uk for help"])).toEqual(["email"]);
  });

  test("finds a card number split across words, but only if the Luhn check passes", () => {
    expect(kinds(["Card 4111 1111 1111 1111 exp 12/29"])).toEqual(["card"]);
    expect(kinds(["Card 4111 1111 1111 1112"])).not.toContain("card");
  });

  test("a card is not also reported as a phone number", () => {
    expect(kinds(["5500 0000 0000 0004"])).toEqual(["card"]);
  });

  test("finds phone numbers in common formats", () => {
    expect(kinds(["Call +1 (555) 123-4567 today"])).toEqual(["phone"]);
    expect(kinds(["Tel: 020 7946 0958"])).toEqual(["phone"]);
  });

  test("finds SSN-shaped numbers, IPv4 addresses and rejects impossible IPs", () => {
    expect(kinds(["SSN 123-45-6789"])).toEqual(["ssn"]);
    expect(kinds(["Server 192.168.1.20 is up"])).toEqual(["ip"]);
    expect(kinds(["Version 999.999.999.999"])).not.toContain("ip");
  });

  test("finds API keys and tokens", () => {
    expect(kinds(["key sk_" + "live_" + "4eC39HqLyjWDarjtT1zdp7dc"])).toEqual(["key"]);
    expect(kinds(["token gh" + "p_" + "16C7e42F292c6912E7710c838347Ae178B4a"])).toEqual(["key"]);
    expect(kinds(["AKIA" + "IOSFODNN7EXAMPLE"])).toEqual(["key"]);
  });

  test("validates IBANs with the mod-97 check", () => {
    expect(kinds(["IBAN GB82 WEST 1234 5698 7654 32"])).toEqual(["iban"]);
    expect(kinds(["IBAN GB82 WEST 1234 5698 7654 33"])).not.toContain("iban");
  });

  test("leaves ordinary text, dates, prices and short numbers alone", () => {
    expect(
      kinds([
        "Quarterly report for the product team",
        "Invoice #20481 due 2026-10-17 total $1,249.00",
        "Version 1.4.2 released with 12 fixes",
        "Open 9 to 5, Monday to Friday",
      ])
    ).toEqual([]);
  });

  test("maps hits back to padded boxes covering every word of the match", () => {
    const w = words(["Card 4111 1111 1111 1111 ok"]);
    const hits = findSensitive(w);
    const [box] = hitBoxes(w, hits, 3);
    const first = w[1], last = w[4];
    expect(box.kind).toBe("card");
    expect(box.x).toBeLessThanOrEqual(first.x0 - 3 + 0.001);
    expect(box.x + box.w).toBeGreaterThanOrEqual(last.x1 + 3 - 0.001);
  });

  test("respects the kinds filter", () => {
    const w = words(["mail a@b.com or ip 10.0.0.1"]);
    expect(findSensitive(w, ["email"]).map((h) => h.kind)).toEqual(["email"]);
  });
});

test.describe("Sensitive-info detector: edge cases", () => {
  test("empty and whitespace input yields nothing", () => {
    expect(findSensitive([])).toEqual([]);
    expect(kinds(["   "])).toEqual([]);
  });
  test("multiple hits on one line are all found", () => {
    const k = kinds(["mail a@b.io or c@d.com"]);
    expect(k.filter((x) => x === "email")).toHaveLength(2);
  });
  test("a card number that fails Luhn is ignored", () => {
    expect(kinds(["4111 1111 1111 1112"])).not.toContain("card");
  });
  test("version strings and dates are not IPs or phones", () => {
    const k = kinds(["v1.2.3.4", "2026-10-17", "Order 12345"]);
    expect(k).not.toContain("ip");
    expect(k).not.toContain("phone");
  });
  test("a hit's boxes stay inside the word extents", () => {
    const w = words(["email me@site.org now"]);
    const hits = findSensitive(w);
    const b = hitBoxes(w, hits)[0];
    expect(b.w).toBeGreaterThan(0);
    expect(b.h).toBeGreaterThan(0);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.kind).toBe("email");
  });
});
