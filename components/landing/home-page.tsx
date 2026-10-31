import Image from "next/image";
import Link from "next/link";
import { Atmos } from "@/components/site/atmos";
import { Illustration } from "@/components/site/illustration";
import { AddToChrome } from "@/components/site/chrome-button";
import { DuoIcon, Icon } from "@/components/site/icon";
import { Reveal } from "@/components/site/reveal";
import { SiteNav } from "@/components/site-nav";
import { SiteFooterIndustry } from "@/components/site-footer-industry";
import type { IconName } from "@/ui/ds/icons";
import { CountUp } from "./count-up";
import { Compare } from "./compare";
import { DemoPlayer } from "./demo-player";
import { UseCases } from "./use-cases";
import s from "./landing.module.css";

// Copy: docs/landing-copy.md. Every claim there is traced to the extension code.

const BANDS: Array<{
  label: string; icon: IconName; tone: "sky" | "peach" | "lilac" | "green"; tint: string; badge?: string;
  title: string; body: string; points: string[]; link: [string, string]; img: string; alt: string;
}> = [
  { label: "Capture", icon: "full-page", tone: "sky", tint: s.tintSky, title: "The whole page, in one image", body: "Click once. GoFully scrolls the page, waits for lazy images, keeps sticky headers from repeating and joins everything into a single screenshot.", points: ["Full page, visible area, a region, one element or a panel that scrolls", "Keyboard shortcuts for the ones you use most", "Save as PNG, JPG, WebP or a multi-page PDF"], link: ["Try it on this page", "/guides/how-to-take-full-page-screenshot-chrome"], img: "/landing/full-page-3.webp", alt: "GoFully scrolling a long article while a progress card counts the screens" },
  { label: "Privacy", icon: "shield", tone: "peach", tint: s.tintPeach, badge: "New", title: "Hide what shouldn’t be seen, before you capture", body: "Redact page covers emails, card numbers, phone numbers, ID numbers and API keys on the live page, at any length, and anything you click. In the editor, blur, pixelate or black out the rest, or let Auto-redact find it.", points: ["Covers text as it loads, so long pages stay covered", "Done puts the page back exactly as it was", "Everything runs on your device. Nothing is uploaded"], link: ["How auto-redact works", "/guides/how-to-auto-redact-sensitive-info"], img: "/landing/redact-page-2.webp", alt: "A billing page with the email, phone, card number and API key covered, and the Redact page bar listing them" },
  { label: "Inspect", icon: "ruler", tone: "green", tint: s.tintGreen, badge: "New", title: "Measure spacing, sizes and colors on any page", body: "Hover any element to see what it is, its size, padding, margin and text style. Click one and hover another for the gap between them, or drag a ruler anywhere. Pick any color on screen and it’s copied as hex.", points: ["CSS pixels, the same numbers as the code", "Measurements stay in the capture, for design feedback", "Click any pixel on screen to copy its color as hex"], link: ["See everything in 1.1.3", "/roadmap#v1-1-3"], img: "/landing/measure-3.webp", alt: "Two cards measured on a live page: their sizes, padding, and the 20 px gap between them" },
  { label: "Text", icon: "text-ocr", tone: "lilac", tint: s.tintLilac, title: "Copy text out of any image", body: "Drag over a chart, a scanned page, a locked PDF or a paused video. GoFully reads it and hands you text you can paste anywhere.", points: ["English, Spanish, French, German, Portuguese and Chinese", "Works offline, no cloud OCR", "Copy as plain text or JSON"], link: ["See supported languages", "/guides/how-to-extract-text-in-multiple-languages-ocr"], img: "/landing/text-3.webp", alt: "GoFully reading a selected line of text on the device" },
  { label: "After the capture", icon: "copy", tone: "sky", tint: s.tintSky, badge: "New", title: "Every capture stays one click away", body: "Quick captures stack up in the corner of the page. Copy, save, edit or pin any of them, drag one onto your desktop or into a folder, or tell GoFully to copy, save or open the editor automatically.", points: ["Each card works on its own capture", "QR codes in a capture are listed, with a safe Open button for web links", "The stack tucks away when you’re not using it"], link: ["See everything in 1.1.3", "/roadmap#v1-1-3"], img: "/landing/stack-1.webp", alt: "A capture card showing a QR code link it found, with an earlier capture folded below" },
  { label: "Share", icon: "beautify", tone: "green", tint: s.tintGreen, title: "From raw screenshot to post in a minute", body: "Add a background, padding, rounded corners and a soft shadow. Frame it in a browser window, tilt it in 3D and save the look as a preset.", points: ["Gradients, wallpapers or a solid colour", "macOS, Windows or browser frames", "Presets for social posts and slides"], link: ["Make one now", "/guides/how-to-beautify-screenshots"], img: "/landing/beautify-3.webp", alt: "A screenshot in a window frame on a gradient background" },
];

const TOOLS: Array<{ icon: IconName; tone: "sky" | "blue" | "green" | "peach" | "lilac"; title: string; body: string; tag?: string }> = [
  { icon: "timer", tone: "blue", title: "Delayed capture", body: "Wait 3, 5 or 10 seconds, open the menu or hover the tooltip, and GoFully captures it.", tag: "New" },
  { icon: "qr-code", tone: "lilac", title: "QR codes and barcodes", body: "Codes in a capture are read on your device. Web links get an Open button; everything else can be copied.", tag: "New" },
  { icon: "settings", tone: "sky", title: "Your after-capture action", body: "Show the card, copy, save as PNG or PDF, open the editor or pin it. Pick one in Settings.", tag: "New" },
  { icon: "draw", tone: "green", title: "Draw on page", body: "Mark up a live website with a pen, highlighter, arrows and notes, then capture it with your marks.", tag: "New" },
  { icon: "element", tone: "blue", title: "Capture one element", body: "Hover a card, table or chat message and click. GoFully crops to its edges.", tag: "New" },
  { icon: "scrolling", tone: "blue", title: "Scrolling panels", body: "Capture a chat, code block or table that scrolls inside its own box." },
  { icon: "guide", tone: "peach", title: "Step-by-step guides", body: "Collect up to 30 captures, write a line under each, export one PDF or Markdown file.", tag: "New" },
  { icon: "pin", tone: "sky", title: "Pin to screen", body: "Float a capture over any page as a reference and fade it to see through." },
  { icon: "search", tone: "lilac", title: "Search your history", body: "Find a past capture by the words inside it, the page title or the address.", tag: "New" },
];

const FAQ: Array<[string, string]> = [
  ["Is GoFully really free?", "Yes. Every capture mode, the editor, OCR, auto-redact, Beautify, guides and PDF export are free. There’s no paid plan."],
  ["Do you see or store my screenshots?", "No. GoFully runs entirely in your browser. It has no account system and no server that receives images."],
  ["Will it capture long pages and pages with sticky headers?", "Yes. GoFully scrolls the page for you, waits for images that load as you scroll and keeps sticky headers and fixed bars from repeating in the result."],
  ["Which browsers does it work in?", "Chrome and browsers built on it, such as Edge, Brave, Arc and Opera. Install it from the Chrome Web Store."],
  ["Can I edit a screenshot after I take it?", "Yes. Add arrows, shapes, text, numbered steps, highlights and blur, crop it, or style it with Beautify. Then copy it or save PNG, JPG, WebP or PDF."],
  ["What languages can it read?", "English, Spanish, French, German, Portuguese and Simplified Chinese. The language files are bundled, so text capture works offline."],
  ["Can I hide private details before I capture?", "Yes. Redact page covers emails, card numbers, phone numbers, ID numbers and API keys on the live page, plus anything you click, then you capture as usual. Done puts the page back."],
  ["Can GoFully measure spacing or pick colors?", "Yes. Measure shows any element’s size, padding, margin and text style, the gap between two elements, and a free ruler. It also picks any color on screen and copies the hex value."],
];

export function HomePage() {
  return (
    <div className={s.page}>
      <div className={s.announce}>
        <div className={s.announceIn}>
          <span className={`${s.tag} ${s.tagSky}`}>New in 1.1.3</span>
          <span>Redact the live page, measure anything, capture hover menus and draw on any site.</span>
          <Link href="/roadmap#v1-1-3">See what’s new →</Link>
        </div>
      </div>
      <SiteNav />

      <main>
        {/* Hero (Figma option A: In your browser) */}
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={s.heroGlow} aria-hidden="true" />
          <div className={s.heroGrain} aria-hidden="true" />
          <div className={s.wrap}>
            <div className={`${s.eyebrow} ${s.rise}`}>
              <span className={`${s.tag} ${s.tagGreen}`}>Free</span>
              Chrome extension for full-page screenshots
            </div>
            <h1 id="hero-title" className={s.h1}>
              <span className={s.rise} style={{ ["--d" as string]: "80ms" }}>Screenshot the whole page.</span>
              <span className={s.rise} style={{ ["--d" as string]: "180ms" }}>Share it ready to go.</span>
            </h1>
            <p className={`${s.sub} ${s.rise}`} style={{ ["--d" as string]: "280ms" }}>
              GoFully captures any webpage top to bottom in one image, then lets you mark it up, hide private details and copy it out. All on your computer, with no account.
            </p>
            <div className={`${s.ctas} ${s.rise}`} style={{ ["--d" as string]: "380ms" }}>
              <AddToChrome size="lg" />
              <a href="#features" className="gf-btn-s" style={{ height: 52, padding: "0 22px", fontSize: 16 }}>See it in action</a>
            </div>
            <div className={`${s.trust} ${s.rise}`} style={{ ["--d" as string]: "460ms" }}>
              <span><Icon name="star" size={16} />5.0 on the Chrome Web Store</span>
              <span><Icon name="lock" size={16} />No sign-up</span>
              <span><Icon name="shield" size={16} />Nothing leaves your device</span>
            </div>
          </div>
          <div className={`${s.heroShot} ${s.heroShotIn}`}>
            <Image
              src="/landing/hero-mockup.webp"
              alt="GoFully open in Chrome on a long article: the capture popup, an editor with an arrow and numbered steps, and a result card"
              width={1340}
              height={646}
              sizes="(max-width: 1200px) 100vw, 1180px"
              quality={90}
              priority
            />
          </div>
        </section>

        {/* Proof */}
        <section className={s.sectionTight} aria-label="GoFully at a glance" style={{ paddingTop: 24 }}>
          <div className={s.wrap}>
            <p className={s.works}>Works in Chrome, Edge, Brave, Arc and Opera</p>
            <div className={s.stats}>
              <div className={s.stat}><b><CountUp to={7} /></b><span>ways to capture</span></div>
              <div className={s.stat}><b><CountUp to={6} /></b><span>OCR languages, offline</span></div>
              <div className={s.stat}><b>0</b><span>uploads</span></div>
              <div className={s.stat}><b>0</b><span>accounts</span></div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className={`${s.section} ${s.alt} ${s.center}`} aria-labelledby="problem-title">
          <div className={s.wrap}>
            <Reveal>
              <h2 id="problem-title" className={s.h2}>Screenshots shouldn’t take five apps.</h2>
              <p className={s.lead}>You scroll and capture three times, stitch the pieces, open another app to blur an email, a third to add an arrow, and still paste a crooked image into the ticket. GoFully does the whole job in the tab you’re already in.</p>
            </Reveal>
            <div className={s.pairs}>
              {([
                ["Five crops", "One clean image", "full-page", "sky"],
                ["Retype the text", "Copy it out of the picture", "text-ocr", "lilac"],
                ["Hope nobody spots the email", "Covered before you share", "shield", "green"],
              ] as const).map(([before, after, ic, tone], i) => (
                <Reveal key={after} delay={i * 80} className={s.pair}>
                  <DuoIcon name={ic} size={20} tone={tone} />
                  <span className={s.before}><Icon name="close" size={16} />{before}</span>
                  <span className={s.after}><span className="ok"><Icon name="check" size={18} /></span>{after}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Demo player */}
        <section id="features" className={`${s.section} ${s.center}`} aria-labelledby="demo-title" style={{ background: "radial-gradient(60% 50% at 80% 40%, color-mix(in srgb, var(--gf-sky) 18%, transparent), transparent 70%)" }}>
          <div className={s.wrap}>
            <Reveal>
              <h2 id="demo-title" className={s.h2}>See every feature in action</h2>
              <p className={s.lead}>Each demo plays the real extension on a real page. Pick one, or let them run.</p>
            </Reveal>
            <DemoPlayer />
          </div>
        </section>

        {/* Feature bands */}
        {BANDS.map((b, i) => (
          <section key={b.label} className={`${s.section} ${i % 2 === 0 ? s.alt : ""}`} aria-label={b.title}>
            <div className={s.wrap}>
              <div className={`${s.band} ${i % 2 ? s.bandFlip : ""}`}>
                <Reveal className={s.bandText}>
                  <span className={s.bandLabel}><DuoIcon name={b.icon} size={16} tone={b.tone} />{b.label}{b.badge && <span className={`${s.tag} ${s.tagSky}`}>{b.badge}</span>}</span>
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                  <ul className={s.checks}>
                    {b.points.map((p) => (<li key={p}><Icon name="check" size={18} /><span>{p}</span></li>))}
                  </ul>
                  <Link href={b.link[1]} className={s.link}>{b.link[0]} <Icon name="chevron-right" size={16} /></Link>
                </Reveal>
                <Reveal delay={120} className={`${s.bandShot} ${b.tint}`}>
                  <Image src={b.img} alt={b.alt} width={960} height={630} sizes="(max-width: 900px) 100vw, 560px" quality={90} />
                </Reveal>
              </div>
            </div>
          </section>
        ))}

        {/* More tools */}
        <section className={`${s.section} ${s.center}`} aria-labelledby="tools-title">
          <div className={s.wrap}>
            <Reveal>
              <h2 id="tools-title" className={s.h2}>Everything after the capture, in the same window</h2>
              <p className={s.lead}>No second app. No upload. No sign-in.</p>
            </Reveal>
            <div className={s.grid3}>
              {TOOLS.map((t, i) => (
                <Reveal key={t.title} delay={(i % 3) * 80} className={`${s.tool} gf-lift`}>
                  <div className={s.toolTop}><DuoIcon name={t.icon} size={20} tone={t.tone} />{t.tag && <span className={s.tag}>{t.tag}</span>}</div>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Compare />

        {/* Use cases */}
        <section id="use-cases" className={`${s.section} ${s.alt} ${s.center}`} aria-labelledby="cases-title">
          <div className={s.wrap}>
            <Reveal>
              <h2 id="cases-title" className={s.h2}>Built for people who send screenshots all day</h2>
            </Reveal>
            <UseCases />
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className={`${s.section} ${s.privacy}`} aria-labelledby="privacy-title">
          <div className={s.wrap}>
            <div className={s.privacyGrid}>
              <Reveal className={s.privacyText}>
                <span className={`${s.tag} ${s.tagSky}`}>Private by design</span>
                <h2 id="privacy-title" className={s.h2}>Your screenshots never leave your computer</h2>
                <p>GoFully has no server to send them to. Capture, editing, OCR and redaction all run inside your browser.</p>
                <Link href="/privacy" className={s.link}>Read the privacy policy <Icon name="chevron-right" size={16} /></Link>
              </Reveal>
              <div className={s.facts}>
                {([
                  ["lock", "No account", "Install and use it. There’s nothing to sign up for."],
                  ["offline", "No uploads", "Images stay in your browser until you save or copy them."],
                  ["history", "You stay in control", "History keeps your last 50 captures on this device. Delete any of them in one click."],
                ] as const).map(([ic, t, d], i) => (
                  <Reveal key={t} delay={i * 90} className={s.fact}>
                    <span className={s.factIcon}><Icon name={ic} size={20} /></span>
                    <div><h3>{t}</h3><p>{d}</p></div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className={`${s.section} ${s.center}`} aria-labelledby="how-title">
          <div className={s.wrap}>
            <Reveal><h2 id="how-title" className={s.h2}>Your first full-page screenshot takes two clicks</h2></Reveal>
            <div className={s.steps}>
              {([
                ["1", "Add GoFully to Chrome", "Free, no sign-up.", "welcome"],
                ["2", "Click the icon, choose Full page", "Or press ⌘⇧F (Ctrl+Shift+F on Windows).", "capture"],
                ["3", "Edit, copy or save", "The editor opens with your capture ready.", "beautify"],
              ] as const).map(([n, t, d, img], i) => (
                <Reveal key={n} delay={i * 100} className={s.step}>
                  <div className={s.stepArt}><Illustration name={img} /></div>
                  <span className={s.stepNum}>{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </Reveal>
              ))}
            </div>
            <div className={s.stepsCta}><AddToChrome size="lg" /></div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={s.faqSection} aria-labelledby="faq-title">
          <div className={s.faqPanel}>
            <div className={s.faqGrid}>
              <div className={s.faqIntro}>
                <Reveal>
                  <span className={s.faqEyebrow}>FAQ</span>
                  <h2 id="faq-title" className={s.h2}>Questions, answered.</h2>
                  <p className={s.faqLede}>Short answers to what people ask before installing.</p>
                </Reveal>
                <Reveal className={s.faqCard} delay={80}>
                  <div className={s.faqArt}><Illustration name="help" /></div>
                  <div className={s.faqCardFoot}>
                    <div>
                      <strong>Still curious?</strong>
                      <span>Ask us anything about GoFully.</span>
                    </div>
                    <Link href="/support" className="gf-btn-s"><Icon name="mail" size={16} />Write to us</Link>
                  </div>
                </Reveal>
              </div>
              <Reveal className={s.faqList} delay={120}>
                {FAQ.map(([q, a], i) => (
                  <details key={q} open={i === 0}>
                    <summary>
                      <span>{q}</span>
                      <span className={s.faqToggle} aria-hidden="true" />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
                <Link href="/faq" className={s.faqMore}>See all questions <Icon name="chevron-right" size={16} /></Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Final CTA: full-bleed band, same as every page's closing band */}
        <section className="gf-band-wrap" aria-labelledby="final-title">
          <Atmos />
          <div className="gf-band">
            <h2 id="final-title">Take a better screenshot in the next ten seconds</h2>
            <p>Free, private, no account. Add it to Chrome and click the icon.</p>
            <AddToChrome size="lg" tone="light" />
            <span className="gf-band-note"><Icon name="star" size={16} />5.0 on the Chrome Web Store</span>
          </div>
        </section>
      </main>

      <SiteFooterIndustry />
    </div>
  );
}
