import { Icon } from "./icon";

export const CWS_URL =
  "https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc";

/** The store link tagged with where it was clicked, so the Web Store dashboard can show which pages bring installs. */
export function cwsLink(from: string): string {
  return `${CWS_URL}?utm_source=gofully-site&utm_medium=${encodeURIComponent(from)}&utm_campaign=website`;
}

/** The one install action. Figma: Button / Add to Chrome (MD and LG). */
export function AddToChrome({
  size = "md",
  label = "Add to Chrome, it’s free",
  tone = "dark",
  className = "",
  from = "button",
}: {
  size?: "md" | "lg";
  label?: string;
  tone?: "dark" | "light";
  className?: string;
  /** Where the button sits, for install attribution (e.g. "home-hero"). */
  from?: string;
}) {
  return (
    <a
      href={cwsLink(from)}
      target="_blank"
      rel="noreferrer"
      className={`gf-cta gf-cta--${size} gf-cta--${tone} ${className}`}
    >
      <span className="gf-cta-badge"><Icon name="chrome" size={size === "lg" ? 20 : 16} /></span>
      <span>{label}</span>
    </a>
  );
}
