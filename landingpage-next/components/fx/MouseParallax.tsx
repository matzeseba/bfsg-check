"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type PointerEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

// Maus-Parallax (Scroll-Story-Modus): der Container normalisiert die Cursor-
// Position auf -1..1 und stellt sie als gefederte MotionValues bereit; jede
// <MouseLayer depth={n}> verschiebt sich um cursor*depth px. Nur Feinzeiger
// (Maus), reduced-motion-still, keine React-Re-Renders pro Frame.

interface MouseCtxValue {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const MouseCtx = createContext<MouseCtxValue | null>(null);

interface MouseParallaxProps {
  children: ReactNode;
  className?: string;
}

export function MouseParallax({ children, className }: MouseParallaxProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.4 });
  const prefersReduced = useReducedMotion();

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    rawY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const ctx = useMemo(() => ({ x, y }), [x, y]);
  return (
    <div className={className} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <MouseCtx.Provider value={ctx}>{children}</MouseCtx.Provider>
    </div>
  );
}

interface MouseLayerProps {
  children: ReactNode;
  /** Verschiebung in px bei voll ausgelenktem Cursor (negativ = gegenläufig). */
  depth?: number;
  className?: string;
}

export function MouseLayer({ children, depth = 16, className }: MouseLayerProps) {
  const ctx = useContext(MouseCtx);
  // Fallback-MotionValues, damit die Hook-Reihenfolge auch ohne Provider stabil ist.
  const zeroX = useMotionValue(0);
  const zeroY = useMotionValue(0);
  const x = useTransform(ctx?.x ?? zeroX, (v) => v * depth);
  const y = useTransform(ctx?.y ?? zeroY, (v) => v * depth);
  // Kein permanentes will-change: Motion promotet das Layer selbst, solange
  // die MotionValues aktiv animieren — dauerhafte Promotion wuerde auf Touch/
  // reduced-motion GPU-Speicher fuer nie feuernde Effekte binden (Review-Fund).
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
