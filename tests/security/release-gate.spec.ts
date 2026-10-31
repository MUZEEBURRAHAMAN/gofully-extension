import { test, expect } from "@playwright/test";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyPackage } from "../../scripts/verify-package.mjs";
import { stripPreviewOnly } from "../../scripts/release-clean.mjs";

// The release gate: the manifest and package may only contain what security/package-policy.json approves.
import { fileURLToPath } from "node:url";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const policy = JSON.parse(readFileSync(join(root, "security/package-policy.json"), "utf8"));
const manifest = () => JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

function copyDist(): string {
  const dir = mkdtempSync(join(tmpdir(), "gf-gate-"));
  cpSync(join(root, "dist"), dir, { recursive: true });
  return dir;
}

test.describe("release gate", () => {
  test("SEC-REL-001: manifest requests exactly the approved permissions and hosts", () => {
    const m = manifest();
    expect([...m.permissions].sort()).toEqual(Object.keys(policy.permissions).sort());
    for (const p of m.permissions) expect(policy.forbiddenPermissions).not.toContain(p);
    for (const h of m.host_permissions ?? []) expect(Object.keys(policy.hostPermissions)).toContain(h);
    expect(m.externally_connectable).toBeUndefined();
  });

  test("SEC-REL-002: extension pages cannot run remote code or talk to the network", () => {
    const csp: string = manifest().content_security_policy.extension_pages;
    for (const need of policy.extensionPagesCsp.required) expect(csp).toContain(need);
    const scriptSrc = csp.match(/script-src[^;]*/)![0];
    const tokens = scriptSrc.split(/\s+/).slice(1);
    expect(tokens.sort()).toEqual(["'self'", "'wasm-unsafe-eval'"]); // WebAssembly for OCR only; no eval, inline or remote scripts
    expect(csp).not.toMatch(/connect-src[^;]*(https?:|\*)/);
  });

  test("SEC-REL-003: websites can reach only the font and the shutter sound, with a per-session URL", () => {
    const war = manifest().web_accessible_resources;
    expect(war.flatMap((e: any) => e.resources).sort()).toEqual([...policy.webAccessibleResources].sort());
    for (const e of war) expect(e.use_dynamic_url).toBe(true);
  });

  test("SEC-REL-004: the dev build passes, and stripping the preview files makes it pass in release mode", () => {
    test.skip(!existsSync(join(root, "dist/manifest.json")), "run node build.mjs first");
    const dir = copyDist();
    expect(verifyPackage(dir, { release: false })).toEqual([]);
    expect(verifyPackage(dir, { release: true }).length, "dev build must fail the release check").toBeGreaterThan(0);
    stripPreviewOnly(dir, policy);
    expect(verifyPackage(dir, { release: true })).toEqual([]);
  });

  test("SEC-REL-005: the verifier rejects a new permission, a remote script and a widened CSP", () => {
    test.skip(!existsSync(join(root, "dist/manifest.json")), "run node build.mjs first");
    const dir = copyDist();
    stripPreviewOnly(dir, policy);
    const m = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    m.permissions.push("cookies");
    m.content_security_policy.extension_pages += " script-src-elem https://evil.example;";
    m.content_security_policy.extension_pages = m.content_security_policy.extension_pages.replace("script-src 'self'", "script-src 'self' 'unsafe-eval'");
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(m));
    writeFileSync(join(dir, "popup.html"), readFileSync(join(dir, "popup.html"), "utf8") + '<script src="https://evil.example/x.js"></script>');
    const problems = verifyPackage(dir, { release: true }).join("\n");
    expect(problems).toMatch(/cookies/);
    expect(problems).toMatch(/unsafe-eval/);
    expect(problems).toMatch(/remote script/);
  });
});
