"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

// Eigenbau-Port aus landingpage/index.html — § 25 TDDDG opt-in vor jedem
// nicht-essenziellen Tracker. Marketing-/Analytics-Tags laden ausschließlich
// nach Consent über window.bfsgLoadTrackers.

const STORAGE_KEY = "bfsg-consent-v1";
const RESET_EVENT = "bfsg:consent-reset";
const CHANGE_EVENT = "bfsg:consent-change";

export type BfsgConsent = {
  marketing: boolean;
  ts: string;
  v: 1;
};

declare global {
  interface Window {
    bfsgConsent?: Partial<BfsgConsent>;
    bfsgLoadTrackers?: () => void;
    bfsgConsentReset?: () => void;
  }
}

function readConsent(): Partial<BfsgConsent> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BfsgConsent;
  } catch {
    return {};
  }
}

function writeConsent(value: BfsgConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Privacy-Mode: localStorage gesperrt — leise fortfahren.
  }
  window.bfsgConsent = value;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function resetConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.bfsgConsent = {};
  window.dispatchEvent(new CustomEvent(RESET_EVENT));
}

// useSyncExternalStore-Subscribe für Reset-/Change-Events.
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(RESET_EVENT, callback);
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(RESET_EVENT, callback);
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Stabile Snapshot-Referenz, damit useSyncExternalStore nicht in einer Schleife läuft.
let cachedConsent: Partial<BfsgConsent> | null = null;
let cachedConsentRaw: string | null = null;

function getSnapshot(): Partial<BfsgConsent> {
  if (typeof window === "undefined") return {};
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedConsentRaw || cachedConsent === null) {
    cachedConsentRaw = raw;
    cachedConsent = readConsent();
  }
  return cachedConsent;
}

// Modul-stabile Referenz, damit getServerSnapshot nicht bei jedem Aufruf ein
// frisches Objekt liefert (React: "should be cached to avoid an infinite loop").
const EMPTY_CONSENT: Partial<BfsgConsent> = {};

function getServerSnapshot(): Partial<BfsgConsent> {
  return EMPTY_CONSENT;
}

// Hydration-Marker: Server liefert false, Client true — verhindert
// SSR-Mismatch des Banners ohne setState in useEffect.
function subscribeMount() {
  return () => {};
}
function getMountedSnapshot() {
  return true;
}
function getMountedServerSnapshot() {
  return false;
}

export function CookieBanner() {
  const consent = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const mounted = React.useSyncExternalStore(
    subscribeMount,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.bfsgConsent = consent;
    if (
      consent.marketing &&
      typeof window.bfsgLoadTrackers === "function"
    ) {
      window.bfsgLoadTrackers();
    }
  }, [consent]);

  const visible = mounted && !consent.ts;

  // Fokus auf den Banner-Titel setzen, sobald er sichtbar wird, damit
  // Tastatur-/Screenreader-Nutzer den Hinweis sofort erreichen (DOM-Ende sonst).
  React.useEffect(() => {
    if (visible) headingRef.current?.focus();
  }, [visible]);

  if (!visible) return null;

  function setConsent(marketing: boolean) {
    writeConsent({
      marketing,
      ts: new Date().toISOString(),
      v: 1,
    });
  }

  return (
    <div
      // Nicht-blockierender Banner ohne Fokus-Trap → role="region" (kein
      // "dialog", das Screenreadern eine Fokusführung verspricht, die es nicht gibt).
      role="region"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-xl border border-border bg-popover p-5 shadow-xl ring-1 ring-foreground/10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2
            id="cookie-banner-title"
            ref={headingRef}
            tabIndex={-1}
            className="font-semibold outline-none"
          >
            Cookies &amp; Tracking
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Wir verwenden ausschließlich technisch notwendige Cookies
            (Session/Sicherheit). Marketing- und Analytics-Tools laden wir erst
            nach Ihrer Einwilligung. Mehr in der{" "}
            <a
              href="/datenschutz"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>
        {/* § 25 TDDDG / Dark-Pattern-Verbot: "Ablehnen" und "Akzeptieren" müssen
            gleichwertig sein (gleiche Größe, gleiches visuelles Gewicht, keine
            Hervorhebung einer Option). Beide Buttons daher identische Variante. */}
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={() => setConsent(false)}
          >
            Nur notwendige
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={() => setConsent(true)}
          >
            Alle akzeptieren
          </Button>
        </div>
      </div>
    </div>
  );
}
