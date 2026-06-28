import type { Metadata } from "next";

import { DsgvoForm } from "@/components/DsgvoForm";

export const metadata: Metadata = {
  title: "DSGVO-Anfrage stellen",
  description:
    "Datenauskunft oder Löschung nach Art. 15 / 17 DSGVO bei Barrierefrei-Prüfen beantragen.",
  alternates: { canonical: "/datenschutz/anfrage" },
  robots: { index: false, follow: true },
};

export default function DsgvoAnfragePage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        DSGVO-Anfrage
      </h1>
      <p className="mt-4 text-muted-foreground text-pretty">
        Stellen Sie hier Ihre Anfrage auf Datenauskunft (Art. 15 DSGVO) oder
        Löschung (Art. 17 DSGVO). Die Bearbeitung erfolgt binnen 30 Tagen nach
        erfolgreicher Identitätsprüfung.
      </p>
      <div className="mt-10 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <DsgvoForm />
      </div>
    </section>
  );
}
