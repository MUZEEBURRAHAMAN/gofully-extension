"use client";

import { useEffect, useRef } from "react";

/** Fades and lifts its children into view once, when 15% is visible. Shows instantly for reduced motion or no IntersectionObserver. */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "span";
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as React.ElementType;
  return (
    <T ref={ref} className={`gf-reveal ${className}`} style={{ ["--gf-delay" as string]: `${delay}ms`, ...style }}>
      {children}
    </T>
  );
}
