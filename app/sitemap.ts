import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";

// Built from the pages that exist, so a new guide or comparison is listed the moment it ships.
// Each URL's date is the last commit that touched its page; when git history isn't available the
// date is left out rather than guessed (search engines ignore lastmod they can't trust).

const BASE = "https://gofully-extension.vercel.app";
const APP = join(/* turbopackIgnore: true */ process.cwd(), "app");
const HIDDEN = new Set(["/uninstall-feedback"]);

function routes(dir = APP, prefix = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) {
      if (name === "page.tsx") out.push(prefix || "/");
      continue;
    }
    if (name.startsWith("_") || name.startsWith("(") || name.startsWith("[") || name === "api") continue;
    out.push(...routes(full, `${prefix}/${name}`));
  }
  return out;
}

function lastCommit(route: string): Date | undefined {
  try {
    const file = join("app", route === "/" ? "" : route, "page.tsx");
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { encoding: "utf8" }).trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
}

function weight(route: string): { priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] } {
  if (route === "/") return { priority: 1, changeFrequency: "weekly" };
  if (route === "/guides" || route === "/alternatives") return { priority: 0.9, changeFrequency: "weekly" };
  if (route.startsWith("/guides/") || route.startsWith("/alternatives/")) return { priority: 0.8, changeFrequency: "monthly" };
  if (route === "/faq" || route === "/roadmap") return { priority: 0.7, changeFrequency: "weekly" };
  return { priority: 0.4, changeFrequency: "yearly" };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes()
    .filter((r) => !HIDDEN.has(r))
    .sort((a, b) => weight(b).priority - weight(a).priority || a.localeCompare(b))
    .map((r) => {
      const modified = lastCommit(r);
      return { url: r === "/" ? BASE : `${BASE}${r}`, ...(modified ? { lastModified: modified } : {}), ...weight(r) };
    });
}
