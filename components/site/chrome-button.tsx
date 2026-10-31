import { Icon } from "./icon";

export const CWS_URL =
  "https://chromewebstore.google.com/detail/gofully-full-page-screens/akfbmhmdlbmljklgajkgoekobofhhofc";

/** The one install action. Figma: Button / Add to Chrome (MD and LG). */
export function AddToChrome({
  size = "md",
  label = "Add to Chrome, it’s free",
  tone = "dark",
  className = "",
}: {
  size?: "md" | "lg";
  label?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <a
      href={CWS_URL}
      target="_blank"
      rel="noreferrer"
      className={`gf-cta gf-cta--${size} gf-cta--${tone} ${className}`}
    >
      <span className="gf-cta-badge"><Icon name="chrome" size={size === "lg" ? 20 : 16} /></span>
      <span>{label}</span>
    </a>
  );
}
