import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { serializeJsonLd } from "../../components/json-ld";

import { fileURLToPath } from "node:url";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

async function headersFor(env: "production" | "development") {
  const prev = process.env.NODE_ENV;
  (process.env as any).NODE_ENV = env;
  try {
    const mod = await import(`../../next.config.mjs?${env}`);
    return Object.fromEntries(mod.securityHeaders.map((h: any) => [h.key, h.value as string]));
  } finally {
    (process.env as any).NODE_ENV = prev;
  }
}

test.describe("website security headers", () => {
  test("SEC-WEB-001: production CSP has no eval, no plugins, no framing, and upgrades insecure requests", async () => {
    const h = await headersFor("production");
    const csp = h["Content-Security-Policy"];
    expect(csp).not.toContain("unsafe-eval");
    for (const d of ["object-src 'none'", "frame-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "upgrade-insecure-requests"]) expect(csp).toContain(d);
    expect(csp).toMatch(/connect-src 'self'(;|$)/);
    // No script may load from another host.
    const scriptSrc = csp.match(/script-src[^;]*/)![0];
    expect(scriptSrc.match(/https?:\/\/[^\s;]+/g)).toBeNull();
  });

  test("SEC-WEB-002: transport and isolation headers are present", async () => {
    const h = await headersFor("production");
    expect(h["Strict-Transport-Security"]).toMatch(/max-age=\d{8,}/);
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    for (const f of ["camera=()", "microphone=()", "geolocation=()", "payment=()"]) expect(h["Permissions-Policy"]).toContain(f);
  });

  test("SEC-WEB-003: eval is allowed only in the dev server", async () => {
    expect((await headersFor("development"))["Content-Security-Policy"]).toContain("unsafe-eval");
  });

  test("SEC-WEB-004: JSON-LD cannot close its script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>", sep: "a b" });
    expect(out).not.toContain("</script");
    expect(out).not.toContain("<");
    expect(out).not.toContain(" ");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });

  test("SEC-WEB-005: every dangerouslySetInnerHTML is JSON-LD through the helper or a bundled SVG", () => {
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(d)) {
        if (n === "node_modules" || n.startsWith(".")) continue;
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.tsx?$/.test(n)) {
          readFileSync(p, "utf8").split("\n").forEach((l, i) => {
            if (!l.includes("dangerouslySetInnerHTML")) return;
            const ok = l.includes("serializeJsonLd(") || /__html: svg\b/.test(l);
            if (!ok) hits.push(`${p.replace(root + "/", "")}:${i + 1}`);
          });
        }
      }
    };
    walk(join(root, "app")); walk(join(root, "components"));
    expect(hits, "unreviewed HTML sinks").toEqual([]);
  });

  test("SEC-WEB-006: links that open a new tab never leak window.opener", () => {
    const bad: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.tsx$/.test(n)) {
          const src = readFileSync(p, "utf8");
          for (const m of src.matchAll(/<(a|Link)\b[^>]*target="_blank"[^>]*>/gs)) if (!/rel="[^"]*(noopener|noreferrer)/.test(m[0])) bad.push(p.replace(root + "/", ""));
        }
      }
    };
    walk(join(root, "app")); walk(join(root, "components"));
    expect(bad).toEqual([]);
  });
});
