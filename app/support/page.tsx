import type { Metadata } from "next";
import Link from "next/link";
import { BlueprintFrame } from "@/components/blueprint-frame";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SupportForm } from "@/components/support-form";

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
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" /><path d="m2 7 10 6 10-6" /></svg>,
  },
  {
    title: "GitHub Issues",
    body: "Report bugs or request features in the open, alongside other users.",
    value: "github.com/MUZEEBURRAHAMAN/gofully-extension",
    href: REPO_URL,
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>,
  },
];

export default function SupportPage() {
  return (
    <div className="gf-industry min-h-screen">
      <SiteNav />

      {/* Breadcrumbs */}
      <div style={{ padding: "40px 24px 10px" }}>
        <div className="mx-auto" style={{ maxWidth: 1080 }}>
          <Breadcrumbs items={[{ label: "Support" }]} />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center" style={{ padding: "30px 24px 64px" }}>
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <span className="inline-block border gf-heading-font font-semibold uppercase" style={{ borderColor: "rgba(22,103,242,.25)", background: "rgba(22,103,242,.06)", color: "var(--gf-color-accent)", fontSize: "10.5px", letterSpacing: "0.06em", padding: "6px 14px" }}>
            Contact
          </span>
          <h1 className="gf-heading-font font-semibold" style={{ fontSize: "clamp(30px, 8vw, 48px)", lineHeight: 1.08, letterSpacing: "-0.01em", marginTop: 22 }}>
            Get in touch with us
          </h1>
          <p className="mx-auto" style={{ fontSize: "15.5px", lineHeight: 1.6, color: "rgba(29,31,32,.55)", maxWidth: 520, marginTop: 18 }}>
            Questions, feedback, or a bug to report — we read and respond to every message.
          </p>
        </div>
      </div>

      {/* Form + channels */}
      <div style={{ padding: "0 24px 100px" }}>
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] items-start" style={{ maxWidth: 1080, gap: 40 }}>
          {/* Form */}
          <section aria-labelledby="contact-form-heading">
            <h2 id="contact-form-heading" className="sr-only">Contact Form</h2>
            <SupportForm />
          </section>

          {/* Alternate channels */}
          <section aria-labelledby="alternate-channels-heading" className="flex flex-col" style={{ gap: 16 }}>
            <h2 id="alternate-channels-heading" className="sr-only">Direct Channels</h2>
            {CHANNELS.map((c) => (
              <BlueprintFrame key={c.title} className="bg-white flex gap-3.5 items-start" style={{ padding: "22px 24px" }}>
                <div className="flex items-center justify-center border flex-shrink-0" style={{ width: 36, height: 36, background: "rgba(22,103,242,.08)", borderColor: "rgba(22,103,242,.2)" }}>
                  {c.icon}
                </div>
                <div>
                  <h3 className="gf-heading-font font-semibold" style={{ fontSize: 15 }}>{c.title}</h3>
                  <p className="mt-1" style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(29,31,32,.55)" }}>{c.body}</p>
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noreferrer" : undefined} className="block mt-2" style={{ font: "12px ui-monospace, Menlo, monospace", color: "var(--gf-color-accent)", wordBreak: "break-all" }}>
                    {c.value}
                  </a>
                </div>
              </BlueprintFrame>
            ))}
            <BlueprintFrame className="bg-white flex gap-3.5 items-start" style={{ padding: "22px 24px" }}>
              <div className="flex items-center justify-center border flex-shrink-0" style={{ width: 36, height: 36, background: "rgba(22,103,242,.08)", borderColor: "rgba(22,103,242,.2)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gf-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <div>
                <h3 className="gf-heading-font font-semibold" style={{ fontSize: 15 }}>Help Center &amp; Guides</h3>
                <p className="mt-1" style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(29,31,32,.55)" }}>
                  Browse our step-by-step guides for capture tutorials and OCR walkthroughs. See our{" "}
                  <Link href="/guides" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>Guides</Link> or the{" "}
                  <Link href="/faq" style={{ color: "var(--gf-color-accent)", fontWeight: 600 }}>FAQ</Link>.
                </p>
              </div>
            </BlueprintFrame>
          </section>
        </div>
      </div>

      <SiteFooterIndustry activeHref="/support" />
    </div>
  );
}
