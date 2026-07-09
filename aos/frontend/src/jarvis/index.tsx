"use client";

/**
 * Jarvis-Mount (Team Gamma). Kapselt Provider + Overlay als eine
 * Client-Boundary — wird am JARVIS_MOUNT in app/layout.tsx eingehaengt.
 */

import { JarvisProvider } from "./JarvisProvider";
import { JarvisOverlay } from "./JarvisOverlay";

export function Jarvis() {
  return (
    <JarvisProvider>
      <JarvisOverlay />
    </JarvisProvider>
  );
}
