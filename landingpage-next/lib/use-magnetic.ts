"use client";

import { useRef, useCallback } from "react";
import { useReducedMotion } from "motion/react";

// Magnetischer Hover (Dark-Glow-Redesign): das Element folgt dem Cursor leicht
// und federt beim Verlassen zurueck. Bewusst ohne Re-Render (direktes
// style.transform) — laeuft nur bei Feinzeigern (Maus) und respektiert
// prefers-reduced-motion. Touch/Keyboard bleiben unbeeinflusst.
export function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T | null>(null);
  const prefersReduced = useReducedMotion();

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const el = ref.current;
      if (!el || prefersReduced || event.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.transition = "transform 0.15s ease-out";
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    },
    [prefersReduced, strength],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translate(0, 0)";
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
