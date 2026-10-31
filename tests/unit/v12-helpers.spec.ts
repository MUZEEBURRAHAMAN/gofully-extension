import { test, expect } from "@playwright/test";
import { findSensitiveRanges } from "../../src/utils/sensitive";
import { safeLink, codeKind } from "../../src/utils/code-links";

test.describe("sensitive text ranges (Redact page)", () => {
  test("finds each kind once, in order, and leaves plain text alone", () => {
    const text = "Mail maya.okafor@example.com, card 4242 4242 4242 4242, call +1 415 555 0134, token eyJhbGciOiJub25lIn0.eyJkZW1vIjoiZ29mdWxseSJ9.ZGVtby1zaWc.";
    const r = findSensitiveRanges(text);
    expect(r.map((x) => x.kind)).toEqual(["email", "card", "phone", "key"]);
    expect(r.map((x) => text.slice(x.start, x.end))).toEqual([
      "maya.okafor@example.com", "4242 4242 4242 4242", "+1 415 555 0134", "eyJhbGciOiJub25lIn0.eyJkZW1vIjoiZ29mdWxseSJ9.ZGVtby1zaWc",
    ]);
    expect(findSensitiveRanges("Plain words with nothing private, 2026 and 42 items.")).toEqual([]);
  });

  test("a card number is not also reported as a phone; an invalid card is not a card", () => {
    expect(findSensitiveRanges("4242 4242 4242 4242").map((x) => x.kind)).toEqual(["card"]);
    expect(findSensitiveRanges("4242 4242 4242 4241").map((x) => x.kind)).not.toContain("card");
  });
});

test.describe("decoded code values", () => {
  test("only http and https addresses become links", () => {
    expect(safeLink("https://gofully.example/qr-test")).toBe("https://gofully.example/qr-test");
    expect(safeLink("  http://example.com  ")).toBe("http://example.com/");
    for (const bad of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", "data:text/html,<script>alert(1)</script>", "file:///etc/passwd", "chrome://settings", "https//missing-colon", "http://"]) {
      expect(safeLink(bad), bad).toBeNull();
    }
  });

  test("kinds are named the way people say them", () => {
    expect(codeKind("https://a.example")).toBe("link");
    expect(codeKind("mailto:a@b.example")).toBe("email");
    expect(codeKind("tel:+14155550134")).toBe("phone");
    expect(codeKind("WIFI:S:Home;T:WPA;P:secret;;")).toBe("wifi");
    expect(codeKind("javascript:alert(1)")).toBe("text");
  });
});
