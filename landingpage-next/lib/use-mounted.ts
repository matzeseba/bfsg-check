"use client";

import * as React from "react";

// Liefert nach dem Client-Mount `true`, serverseitig `false` — via
// useSyncExternalStore, um setState-in-effect und Hydration-Mismatch zu
// vermeiden. Nuetzlich fuer client-only-Werte (z. B. aufgeloestes Theme).
const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
