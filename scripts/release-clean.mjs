// Release builds ship only what the extension uses. The design-preview shim (ds/chrome-stub.js, which fakes the
// chrome.* API with sample data) and its sample images are for reviewing pages in a plain browser tab, and the
// website's robots.txt and sitemap.xml are not part of an extension. Dev builds keep them.
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export function stripPreviewOnly(dist, policy) {
  for (const f of policy.previewOnlyFiles) {
    const p = resolve(dist, f);
    if (existsSync(p)) rmSync(p);
  }
  for (const name of readdirSync(dist).filter((n) => n.endsWith(".html"))) {
    const file = resolve(dist, name);
    const html = readFileSync(file, "utf8");
    const clean = html.replace(/[ \t]*<script src="ds\/chrome-stub\.js"><\/script>\r?\n?/g, "");
    if (clean !== html) writeFileSync(file, clean);
  }
}
