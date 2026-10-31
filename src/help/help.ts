import { applyTheme, watchTheme } from "../utils/theme";

applyTheme();
watchTheme();

// Read straight from the manifest so this can't drift out of sync with the
// actual shipped version again (it previously sat hardcoded as "v1.1.0" while
// the manifest had already moved to 1.1.2).
const navVersionTag = document.getElementById("navVersionTag");
if (navVersionTag) {
  navVersionTag.textContent = `v${chrome.runtime.getManifest().version} · Help and guides`;
}

const accordions = document.querySelectorAll(".help-accordion");

accordions.forEach((acc) => {
  const header = acc.querySelector(".help-header");
  header?.addEventListener("click", () => {
    const isOpen = acc.classList.contains("open");
    
    // Close other accordions for clean focus (accordion mode)
    accordions.forEach((other) => {
      if (other !== acc) {
        other.classList.remove("open");
        const otherHeader = other.querySelector(".help-header");
        if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
      }
    });

    if (isOpen) {
      acc.classList.remove("open");
      header.setAttribute("aria-expanded", "false");
    } else {
      acc.classList.add("open");
      header.setAttribute("aria-expanded", "true");
    }
  });
});

// Setup quick shortcut links
document.getElementById("openShortcutsBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

// ── Topic list and search (Figma: Help / Article, Help / Search no results) ──
const searchEl = document.getElementById("helpSearch") as HTMLInputElement | null;
const tocEl = document.getElementById("tocList");
const noResults = document.getElementById("noResults");
const noResultsTitle = document.getElementById("noResultsTitle");
const topics = Array.from(document.querySelectorAll<HTMLElement>(".help-accordion"));

const topicTitle = (el: HTMLElement) => (el.querySelector(".help-title")?.firstChild?.textContent ?? "").trim();
const links = topics.map((t) => {
  const a = document.createElement("a");
  a.href = `#${t.id}`;
  const label = document.createElement("span");
  label.textContent = topicTitle(t);
  a.appendChild(label);
  if (t.querySelector(".gf-tag")) {
    const tag = document.createElement("span");
    tag.className = "gf-tag gf-tag--sky";
    tag.textContent = "New";
    a.appendChild(tag);
  }
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openTopic(t);
    t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${t.id}`);
  });
  tocEl?.appendChild(a);
  return a;
});

function openTopic(t: HTMLElement): void {
  topics.forEach((o) => {
    const on = o === t;
    o.classList.toggle("open", on);
    o.querySelector(".help-header")?.setAttribute("aria-expanded", String(on));
  });
  setActive(t);
}
function setActive(t: HTMLElement | null): void {
  links.forEach((a, i) => a.classList.toggle("active", topics[i] === t));
}
// Keep the opened topic in the list, so the sidebar always shows where you are.
topics.forEach((t) => t.querySelector(".help-header")?.addEventListener("click", () => setActive(t.classList.contains("open") ? t : null)));
setActive(topics.find((t) => t.classList.contains("open")) ?? null);
if (location.hash) {
  const target = topics.find((t) => `#${t.id}` === location.hash);
  if (target) openTopic(target);
}

function clearMarks(root: HTMLElement): void {
  root.querySelectorAll("mark.hit").forEach((m) => m.replaceWith(document.createTextNode(m.textContent ?? "")));
  root.normalize();
}
function markTerms(root: HTMLElement, terms: string[]): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const re = new RegExp(`(${terms.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  for (const n of nodes) {
    if (!re.test(n.data)) { re.lastIndex = 0; continue; }
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    n.data.split(re).forEach((part, i) => {
      if (i % 2) { const m = document.createElement("mark"); m.className = "hit"; m.textContent = part; frag.appendChild(m); }
      else if (part) frag.appendChild(document.createTextNode(part));
    });
    n.replaceWith(frag);
  }
}

function filterTopics(): void {
  const q = (searchEl?.value ?? "").trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let shown = 0;
  topics.forEach((t, i) => {
    clearMarks(t);
    const hay = (t.textContent ?? "").toLowerCase();
    const match = !terms.length || terms.every((w) => hay.includes(w));
    t.hidden = !match;
    links[i].hidden = !match;
    if (match) shown++;
    if (match && terms.length) markTerms(t, terms);
  });
  if (terms.length) {
    // Open the first match so the answer is on screen.
    const first = topics.find((t) => !t.hidden);
    if (first) openTopic(first);
  }
  noResults?.classList.toggle("show", shown === 0);
  if (noResultsTitle) noResultsTitle.textContent = shown === 0 ? `No help articles match “${searchEl?.value.trim()}”` : "";
}
searchEl?.addEventListener("input", filterTopics);
document.getElementById("clearSearch")?.addEventListener("click", () => {
  if (searchEl) searchEl.value = "";
  filterTopics();
  searchEl?.focus();
});
// "/" jumps to search, like most docs sites.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchEl && !(e.target as HTMLElement)?.closest("input, textarea")) {
    e.preventDefault();
    searchEl?.focus();
  }
});
