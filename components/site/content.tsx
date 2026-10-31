import Link from "next/link";
import { AddToChrome } from "./chrome-button";
import { Atmos } from "./atmos";

/** Content-page kit. Styles live in app/site.css (gf-head, gf-band, gf-badge…). */

export function Badge({
  children,
  tone = "blue",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "blue" | "neutral" | "green" | "new";
  className?: string;
}) {
  return <span className={`gf-badge gf-badge--${tone} ${className}`}>{children}</span>;
}

/** Page title block: eyebrow badge, serif H1, lede, meta row. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
  children,
  align = "center",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: React.ReactNode[];
  children?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <header className={`gf-head gf-head--${align}`}>
      <div className="gf-head-in">
        {eyebrow && <Badge tone={/new/i.test(String(eyebrow)) ? "new" : "blue"}>{eyebrow}</Badge>}
        <h1>{title}</h1>
        {lede && <p className="gf-lede">{lede}</p>}
        {meta && meta.length > 0 && (
          <div className="gf-meta">
            {meta.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}

/** Closing call to action, same on every content page. */
export function CtaBand({
  title,
  sub,
  label,
  action,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  label?: string;
  /** Replaces the install button, e.g. a link to Support. */
  action?: { href: string; label: string };
}) {
  return (
    <section className="gf-band-wrap">
      <Atmos />
      <div className="gf-band">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
        {action ? (
          <Link href={action.href} className="gf-cta gf-cta--lg gf-cta--light gf-cta--plain">
            {action.label} <span className="gf-arrow" aria-hidden="true">→</span>
          </Link>
        ) : (
          <AddToChrome size="lg" tone="light" label={label} />
        )}
      </div>
    </section>
  );
}
