import type { Metadata } from "next";

import { DsgvoForm } from "@/components/DsgvoForm";

export const metadata: Metadata = {
  title: "DSGVO-Anfrage stellen",
  description:
    "Datenauskunft oder Löschung nach Art. 15 / 17 DSGVO bei BFSG-Check beantragen.",
  robots: { index: false, follow: true },
};

export default function DsgvoAnfragePage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        DSGVO-Anfrage
      </h1>
      <p className="mt-4 text-muted-foreground">
        Stellen Sie hier Ihre Anfrage auf Datenauskunft (Art. 15 DSGVO) oder
        Löschung (Art. 17 DSGVO). Die Bearbeitung erfolgt binnen 30 Tagen nach
        erfolgreicher Identitätsprüfung.
      </p>
      <div className="mt-10">
        <DsgvoForm />
      </div>
    </section>
  );
}
