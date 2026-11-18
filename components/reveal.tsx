"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fade + slide-in on scroll. Respects prefers-reduced-motion.
 *
 * Content is VISIBLE by default: without JavaScript (or before the
 * IntersectionObserver runs) nothing is ever hidden — the page never
 * renders blank. Only once JS + IntersectionObserver are running does
 * the component hide below-fold content and fade it in on scroll.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible (safe for no-JS / SSR); JS then takes over animation.
  const [visible, setVisible] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    setAnimated(true);
    setVisible(false);
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${
        animated && !visible ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
