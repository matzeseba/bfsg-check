"use client";

import { type ReactNode, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

interface TiltCardProps {
  children: ReactNode;
  /** Maximale Neigung in Grad (5–8 wirkt hochwertig, mehr wird spielzeughaft). */
  max?: number;
  className?: string;
}

// 3D-Tilt (Scroll-Story-Modus): die Karte neigt sich dem Cursor entgegen und
// federt beim Verlassen zurück. Nur Feinzeiger, reduced-motion-still, reine
// transform-Animation über MotionValues (kein Re-Render pro Frame).
// Der Wrapper trägt die Rotation — das Kind (z. B. GlowCard) bleibt unberührt.
export function TiltCard({ children, max = 6, className }: TiltCardProps) {
  const rawRx = useMotionValue(0);
  const rawRy = useMotionValue(0);
  const rotateX = useSpring(rawRx, { stiffness: 180, damping: 20, mass: 0.5 });
  const rotateY = useSpring(rawRy, { stiffness: 180, damping: 20, mass: 0.5 });
  const prefersReduced = useReducedMotion();

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rawRx.set(-py * max * 2);
    rawRy.set(px * max * 2);
  };
  const onPointerLeave = () => {
    rawRx.set(0);
    rawRy.set(0);
  };

  // Kein permanentes will-change: 11 grosse Karten-Instanzen waeren sonst auch
  // auf Touch/reduced-motion dauerhaft layer-promoted, obwohl der Effekt dort
  // nie feuert — Motion verwaltet will-change bei aktiver Animation selbst.
  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
