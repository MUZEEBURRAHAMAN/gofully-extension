#!/usr/bin/env node
// Checks a built extension folder against security/package-policy.json.
//   node scripts/verify-package.mjs [dir] [--release]
// Without --release it accepts the design-preview shim (dev builds keep it). With --release it must be gone.
// Exit code 1 and a list of problems if anything is outside the approved surface.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(join(root, "security/package-policy.json"), "utf8"));

export function verifyPackage(dir, { release = false } = {}) {
  const problems = [];
  const fail = (m) => problems.push(m);
  const has = (rel) => existsSync(join(dir, rel));

  if (!has("manifest.json")) return ["manifest.json is missing"];
  const m = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));

  // Permissions: exactly the approved set. Anything new must be added to the policy (and so reviewed).
  const approved = Object.keys(policy.permissions);
  for (const p of m.permissions ?? []) if (!approved.includes(p)) fail(`permission "${p}" is not in the approved policy`);
  for (const p of approved) if (!(m.permissions ?? []).includes(p)) fail(`approved permission "${p}" is no longer requested; remove it from the policy`);
  for (const p of [...(m.permissions ?? []), ...(m.optional_permissions ?? [])]) if (policy.forbiddenPermissions.includes(p)) fail(`forbidden permission "${p}"`);
  if (m.optional_permissions?.length) fail("optional_permissions are not part of the approved surface");
  const hosts = [...(m.host_permissions ?? []), ...(m.content_scripts ?? []).flatMap((c) => c.matches ?? [])];
  for (const h of hosts) if (!(h in policy.hostPermissions)) fail(`host access "${h}" is not in the approved policy`);
  for (const k of policy.forbiddenManifestKeys) if (k in m) fail(`manifest key "${k}" is not allowed`);

  // Web-accessible resources: exactly the approved list, nothing a website could use to probe or frame the extension.
  const war = (m.web_accessible_resources ?? []).flatMap((e) => e.resources ?? []);
  for (const r of war) if (!policy.webAccessibleResources.includes(r)) fail(`web-accessible resource "${r}" is not approved (any website can request it)`);
  for (const r of policy.webAccessibleResources) if (!war.includes(r)) fail(`approved web-accessible resource "${r}" is missing`);
  for (const e of m.web_accessible_resources ?? []) if (e.use_dynamic_url !== true) fail("web_accessible_resources entry must set use_dynamic_url: true so websites cannot fingerprint the extension");

  // Content security policy for extension pages.
  const csp = (m.content_security_policy?.extension_pages ?? "").replace(/\s+/g, " ");
  for (const need of policy.extensionPagesCsp.required) if (!csp.includes(need)) fail(`extension CSP is missing "${need}"`);
  const scriptSrc = (csp.match(/script-src[^;]*/) ?? [""])[0];
  for (const bad of policy.extensionPagesCsp.forbiddenTokens) if (scriptSrc.split(" ").includes(bad)) fail(`extension CSP script-src contains ${bad}`);

  // Every file the manifest points at exists.
  const refs = [
    m.action?.default_popup, m.background?.service_worker,
    ...Object.values(m.icons ?? {}), ...Object.values(m.action?.default_icon ?? {}),
    ...(m.content_scripts ?? []).flatMap((c) => c.js ?? []),
    ...war.filter((r) => !r.includes("*")),
  ].filter(Boolean);
  for (const r of refs) if (!has(r)) fail(`manifest references "${r}", which is not in the package`);

  // Walk the package.
  const walk = (d) => readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  for (const file of walk(dir)) {
    const rel = relative(dir, file);
    if (/\.(map|ts|tsx|env|pem|key)$/.test(rel) || /(^|\/)\.env/.test(rel)) fail(`"${rel}" should not ship`);
    if (rel.endsWith(".html")) {
      const html = readFileSync(file, "utf8");
      if (/<script\b(?![^>]*\bsrc=)[^>]*>/i.test(html)) fail(`${rel}: inline <script> (blocked by the extension CSP)`);
      if (/<script\b[^>]*\bsrc=["']?(https?:)?\/\//i.test(html)) fail(`${rel}: loads a remote script`);
      if (/\son[a-z]+\s*=\s*["']/i.test(html)) fail(`${rel}: inline event handler attribute`);
      if (/href\s*=\s*["']\s*javascript:/i.test(html)) fail(`${rel}: javascript: link`);
      if (/<iframe\b/i.test(html)) fail(`${rel}: contains an iframe (CSP frame-src is 'none')`);
      if (release && /chrome-stub/.test(html)) fail(`${rel}: still loads the design-preview shim`);
    }
  }
  if (release) for (const f of policy.previewOnlyFiles) if (has(f)) fail(`"${f}" is preview-only and must not ship`);
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const release = args.includes("--release");
  const zipAt = args.indexOf("--zip");
  let dir = resolve(args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--zip") ?? join(root, "dist"));
  let scratch = null;
  if (zipAt >= 0) {
    // Check the file that will actually be uploaded, not the folder it was made from.
    scratch = mkdtempSync(join(tmpdir(), "gofully-package-"));
    execFileSync("unzip", ["-q", resolve(args[zipAt + 1]), "-d", scratch]);
    dir = scratch;
  }
  const problems = verifyPackage(dir, { release });
  if (scratch) rmSync(scratch, { recursive: true, force: true });
  if (problems.length) {
    console.error(`Package check failed (${zipAt >= 0 ? args[zipAt + 1] : dir}):`);
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
  console.log(`Package check passed (${release ? "release" : "dev"} mode): ${zipAt >= 0 ? args[zipAt + 1] : dir}`);
}
