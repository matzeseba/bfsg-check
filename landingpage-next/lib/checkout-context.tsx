"use client";

import * as React from "react";

import type { PackageId } from "@/lib/config";

type CheckoutState = {
  open: boolean;
  pkg: PackageId | null;
  url: string;
};

type CheckoutContextValue = {
  state: CheckoutState;
  openCheckout: (pkg: PackageId, url?: string) => void;
  closeCheckout: () => void;
  setUrl: (url: string) => void;
};

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CheckoutState>({
    open: false,
    pkg: null,
    url: "",
  });

  const openCheckout = React.useCallback((pkg: PackageId, url?: string) => {
    setState((prev) => ({ open: true, pkg, url: url ?? prev.url }));
  }, []);

  const closeCheckout = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const setUrl = React.useCallback((url: string) => {
    setState((prev) => ({ ...prev, url }));
  }, []);

  const value = React.useMemo(
    () => ({ state, openCheckout, closeCheckout, setUrl }),
    [state, openCheckout, closeCheckout, setUrl],
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
