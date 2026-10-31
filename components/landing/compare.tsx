import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/site/icon";
import { Reveal } from "@/components/site/reveal";
import s from "./landing.module.css";

/** "GoFully vs paying for four tools" (layout after jace.ai). Prices match the sourced
 *  figures on /alternatives (public websites and Chrome Web Store listings, September 2026). */
const TOOLS = [
  { name: "GoFullPage Premium", initial: "G", job: "Full-page capture, editing paid", price: "$12/yr", year: 12 },
  { name: "Awesome Screenshot", initial: "A", job: "Annotation, cloud storage", price: "$6/mo", year: 72 },
  { name: "FireShot Pro", initial: "F", job: "PDF export and editing", price: "$39.95", year: 39.95 },
  { name: "Nimbus Capture", initial: "N", job: "Workspace and markup", price: "$7/mo", year: 84 },
];

const GETS = [
  { text: "Full-page capture with the editor included", replaces: "GoFullPage Premium" },
  { text: "Arrows, blur and auto-redact, never uploaded", replaces: "Awesome Screenshot" },
  { text: "Multi-page PDF and every image format", replaces: "FireShot Pro" },
  { text: "Text capture, Beautify and step-by-step guides", replaces: "Nimbus Capture" },
];

const total = TOOLS.reduce((n, t) => n + t.year, 0).toFixed(2);

export function Compare() {
  return (
    <section id="compare" className={`${s.section} ${s.center}`} aria-labelledby="compare-title">
      <div className={s.wrap}>
        <Reveal>
          <h2 id="compare-title" className={s.h2}>Four screenshot tools, or one</h2>
          <p className={s.lead}>Most people stitch capture, markup, PDF and text tools together and pay for each. GoFully does all of it, on your device, for nothing.</p>
        </Reveal>

        <div className={s.vs}>
          <Reveal className={s.vsSide}>
            <ul className={s.vsTools}>
              {TOOLS.map((t, i) => (
                <li key={t.name} className={s.vsTool} style={{ ["--i" as string]: i }}>
                  <span className={s.vsAvatar} aria-hidden="true">{t.initial}</span>
                  <span className={s.vsToolText}><strong>{t.name}</strong><span>{t.job}</span></span>
                  <span className={s.vsPrice}>{t.price}</span>
                </li>
              ))}
            </ul>
            <div className={s.vsTotal}><span>First year</span><b>${total}</b></div>
          </Reveal>

          <span className={s.vsMark} aria-hidden="true">vs</span>

          <Reveal className={s.vsSide} delay={120}>
            <div className={s.vsUs}>
              <span className={s.vsLogo}><Image src="/brand/gofully-symbol.png" alt="" width={56} height={56} /></span>
              <ul className={s.vsGets}>
                {GETS.map((g) => (
                  <li key={g.text}>
                    <span className={s.vsCheck}><Icon name="check" size={14} /></span>
                    <span>
                      {g.text}
                      <em>Replaces <span>{g.replaces}</span></em>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${s.vsTotal} ${s.vsTotalUs}`}><span>Every year</span><b>$0<small> free</small></b></div>
          </Reveal>
        </div>
        <p className={s.vsNote}>
          Prices from each product’s website and Chrome Web Store listing, September 2026. <Link href="/alternatives">See the full comparison</Link>.
        </p>
      </div>
    </section>
  );
}
