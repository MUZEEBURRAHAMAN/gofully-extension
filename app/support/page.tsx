import type { Metadata } from "next";
import type { IconName } from "@/ui/ds/icons";
import { DuoGlyph } from "@/components/site/icon";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SupportForm } from "@/components/support-form";
import { PageHeader } from "@/components/site/content";

export const metadata: Metadata = {
  title: "Support & Help Desk — GoFully",
  description:
    "Contact GoFully support for questions, bug reports, feature suggestions, or security disclosures. We're here to help.",
  alternates: { canonical: "https://gofully-extension.vercel.app/support" },
  openGraph: {
    title: "Support & Help Desk — GoFully",
    description: "Questions, feedback, or a bug to report? Contact the GoFully team.",
    url: "https://gofully-extension.vercel.app/support",
    siteName: "GoFully",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support & Help Desk — GoFully",
    description: "Get support for the GoFully Chrome extension.",
  },
};

const REPO_URL = "https://github.com/MUZEEBURRAHAMAN/gofully-extension";

const CHANNELS = [
  {
    title: "Email support",
    body: "For anything not urgent — we typically reply within a day.",
    value: "rahamanmuzeeb1108@gmail.com",
    href: "mailto:rahamanmuzeeb1108@gmail.com",
    icon: "mail" as IconName,
  },
  {
    title: "GitHub Issues",
    body: "Report bugs or request features in the open, alongside other users.",
    value: "github.com/MUZEEBURRAHAMAN/gofully-extension",
    href: REPO_URL,
    icon: "external" as IconName,
  },
];

export default function SupportPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      <div className="gf-crumbs">
        <Breadcrumbs items={[{ label: "Support" }]} />
      </div>

      {/* Hero */}
      <PageHeader
        eyebrow="Contact"
        title="Get in touch with us"
        lede="Questions, feedback, or a bug to report — we read and respond to every message."
      />

      <div className="gf-support">
        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="sr-only">Contact form</h2>
          <SupportForm />
        </section>

        <section aria-labelledby="alternate-channels-heading" className="gf-channels">
          <h2 id="alternate-channels-heading" className="sr-only">Direct channels</h2>
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noreferrer" : undefined}
              className="gf-channel"
            >
              <span className="gf-duo gf-perm-ico"><DuoGlyph name={c.icon} size={18} /></span>
              <span className="gf-channel-text">
                <strong>{c.title}</strong>
                <span className="gf-small">{c.body}</span>
                <code>{c.value}</code>
              </span>
            </a>
          ))}
          <Link href="/guides" className="gf-channel">
            <span className="gf-duo gf-perm-ico"><DuoGlyph name="guide" size={18} /></span>
            <span className="gf-channel-text">
              <strong>Guides and FAQ</strong>
              <span className="gf-small">Step-by-step capture tutorials and OCR walkthroughs. Most questions are answered there.</span>
            </span>
          </Link>
        </section>
      </div>

      <SiteFooterIndustry activeHref="/support" />
    </div>
  );
}
