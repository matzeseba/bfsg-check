"use client";

import * as React from "react";

import type { EligibilityResult } from "@/components/EligibilityCheck";
import type { PackageId } from "@/lib/config";

type CheckoutState = {
  open: boolean;
  pkg: PackageId | null;
  url: string;
  // Ergebnis des Betroffenheits-Checks (Schritt 0 im CheckoutModal, D1 aus
  // agent-02-funnel-website.md). Bewusst nur im Speicher des Seitenbesuchs
  // (kein localStorage → keine TDDDG-Einwilligungsfrage); Rückkehrer im
  // selben Besuch überspringen den Check („Skip für Rückkehrer", D1).
  eligibility: EligibilityResult | null;
};

type CheckoutContextValue = {
  state: CheckoutState;
  openCheckout: (pkg: PackageId, url?: string) => void;
  closeCheckout: () => void;
  setUrl: (url: string) => void;
  setEligibility: (result: EligibilityResult | null) => void;
};

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CheckoutState>({
    open: false,
    pkg: null,
    url: "",
    eligibility: null,
  });

  const openCheckout = React.useCallback((pkg: PackageId, url?: string) => {
    setState((prev) => ({ ...prev, open: true, pkg, url: url ?? prev.url }));
  }, []);

  const closeCheckout = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const setUrl = React.useCallback((url: string) => {
    setState((prev) => ({ ...prev, url }));
  }, []);

  const setEligibility = React.useCallback((result: EligibilityResult | null) => {
    setState((prev) => ({ ...prev, eligibility: result }));
  }, []);

  const value = React.useMemo(
    () => ({ state, openCheckout, closeCheckout, setUrl, setEligibility }),
    [state, openCheckout, closeCheckout, setUrl, setEligibility],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = React.useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return ctx;
}
