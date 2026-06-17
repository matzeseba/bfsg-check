import type { Metadata } from "next";

import { WiderrufForm } from "@/components/WiderrufForm";

export const metadata: Metadata = {
  title: "Vertrag widerrufen",
  description:
    "Verbraucher-Widerruf nach §§ 355 ff. BGB für Bestellungen bei BFSG-Check.",
  robots: { index: false, follow: true },
};

export default function WiderrufPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Vertrag widerrufen
      </h1>
      <p className="mt-4 text-muted-foreground text-pretty">
        Als Verbraucherin oder Verbraucher haben Sie das Recht, den Vertrag
        binnen 14 Tagen ohne Angabe von Gründen zu widerrufen. Bitte füllen Sie
        das folgende Formular aus — oder senden Sie eine formlose Erklärung an{" "}
        <a href="mailto:widerruf@bfsg-fix.de" className="underline">
          widerruf@bfsg-fix.de
        </a>
        .
      </p>
      <div className="mt-10 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <WiderrufForm />
      </div>
    </section>
  );
}
