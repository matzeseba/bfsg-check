"use client";

import * as React from "react";

// Schmaler Lese-Fortschrittsbalken am oberen Rand (Design-Signatur). Rein
// dekorativ → aria-hidden, KEIN role=progressbar (sonst kuendigt AT ihn als
// bedeutungstragend an). Scroll-getrieben via rAF; bei reduced-motion unkritisch
// (ein Fortschrittsbalken bewegt sich nur mit dem Scroll, keine Eigen-Animation).
export function ScrollProgress() {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    function update() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? (el.scrollTop / max) * 100 : 0);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        className="h-full w-full origin-left bg-gradient-to-r from-brand-mint to-brand-mint-soft shadow-[0_0_12px_var(--brand-mint)]"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}
