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
    <section className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Vertrag widerrufen
      </h1>
      <p className="mt-4 text-muted-foreground">
        Als Verbraucherin oder Verbraucher haben Sie das Recht, den Vertrag
        binnen 14 Tagen ohne Angabe von Gründen zu widerrufen. Bitte füllen Sie
        das folgende Formular aus — oder senden Sie eine formlose Erklärung an{" "}
        <a href="mailto:widerruf@bfsg-fix.de" className="underline">
          widerruf@bfsg-fix.de
        </a>
        .
      </p>
      <div className="mt-10">
        <WiderrufForm />
      </div>
    </section>
  );
}
