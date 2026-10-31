"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { DuoIcon } from "@/components/site/icon";
import { DEMOS, frameSrc } from "./demo-data";
import s from "./landing.module.css";

const STEP_MS = 1900;
const HOLD_MS = 2600; // the finished frame stays a little longer

/** "See every feature in action": plays the real extension, one feature at a time. Figma: Landing v2 › See it in action. */
export function DemoPlayer() {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false); // user picked a feature: loop it instead of moving on
  const [paused, setPaused] = useState(false); // only the pause button sets this
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const demo = DEMOS[active];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = inView && !paused && !reduced;

  useEffect(() => {
    if (!playing) return;
    const last = step === 3;
    const t = window.setTimeout(() => {
      if (!last) setStep(step + 1);
      else if (manual) setStep(0);
      else { setActive((active + 1) % DEMOS.length); setStep(0); }
    }, last ? HOLD_MS : STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, step, active, manual]);

  const pick = useCallback((i: number) => { setActive(i); setStep(0); setManual(true); }, []);
  // With reduced motion, show the finished frame; people step through with the segments.
  const shown = reduced && step === 0 ? 3 : step;

  return (
    <div
      ref={rootRef}
      className={s.player}
    >
      <ul className={s.playerList} role="tablist" aria-label="Features">
        {DEMOS.map((d, i) => (
          <li key={d.id} role="presentation">
            <button
              type="button"
              role="tab"
              id={`demo-tab-${d.id}`}
              aria-selected={i === active}
              aria-controls="demo-stage"
              className={`${s.playerItem} ${i === active ? s.playerItemOn : ""}`}
              onClick={() => pick(i)}
            >
              <DuoIcon name={d.icon} size={18} tone={i === active ? "sky" : "blue"} />
              <span className={s.playerItemText}>
                <strong>{d.title}{d.badge && <em className={s.playerBadge}>{d.badge}</em>}</strong>
                <span>{d.blurb}</span>
              </span>
              <span className={s.playerItemBar} aria-hidden="true">
                <i style={i === active ? { transform: `scaleX(${(shown + (playing ? 1 : 0)) / 4})` } : undefined} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={s.playerStage} id="demo-stage" role="tabpanel" aria-labelledby={`demo-tab-${demo.id}`}>
        <div className={s.playerFrame}>
          {[0, 1, 2, 3].map((n) => (
            <Image
              key={`${demo.id}-${n}`}
              src={frameSrc(demo.id, n + 1)}
              alt={n === shown ? `${demo.alt}. Step ${n + 1}: ${demo.steps[n]}` : ""}
              aria-hidden={n !== shown}
              width={960}
              height={630}
              sizes="(max-width: 900px) 100vw, 800px"
              quality={90}
              className={`${s.playerImg} ${n === shown ? s.playerImgOn : ""}`}
              priority={active === 0 && n < 2}
            />
          ))}
          {!reduced && (
            <button
              type="button"
              className={s.playerChip}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play the demo" : "Pause the demo"}
            >
              <span className={s.dotLive} data-on={playing} />
              {paused ? "Play" : "Pause"}
            </button>
          )}
        </div>
        <ol className={s.playerSteps} aria-label={`${demo.title} steps`}>
          {demo.steps.map((t, n) => (
            <li key={t}>
              <button type="button" className={`${s.playerStep} ${n === shown ? s.playerStepOn : ""} ${n < shown ? s.playerStepDone : ""}`} onClick={() => { setStep(n); setManual(true); }}>
                <i aria-hidden="true" />
                <span>{n + 1}&nbsp; {t}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
