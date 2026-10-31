"use client";

import { useEffect, useRef } from "react";

/** Arms the draw-in only once JS runs, so without JS the illustration simply shows. */
export function IllMotion({ svg, className }: { svg: string; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < innerHeight * 0.9) { el.classList.add("is-drawn"); return; }
    el.classList.add("is-armed");
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-drawn");
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
