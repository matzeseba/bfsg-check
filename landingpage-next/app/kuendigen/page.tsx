import type { Metadata } from "next";

import { KuendigungForm } from "@/components/KuendigungForm";

export const metadata: Metadata = {
  title: "Abo kündigen",
  description:
    "Re-Check-Abo bei BFSG-Fuchs jederzeit ohne Angabe von Gründen kündigen.",
  alternates: { canonical: "/kuendigen" },
  robots: { index: false, follow: true },
};

export default function KuendigenPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Abo kündigen
      </h1>
      <p className="mt-4 text-muted-foreground text-pretty">
        Ihr Re-Check-Abo ist jederzeit zum Ende der laufenden Abrechnungsperiode
        kündbar — auf Wunsch auch sofort. Eine formlose E-Mail an{" "}
        <a href="mailto:kuendigen@bfsg-fix.de" className="underline">
          kuendigen@bfsg-fix.de
        </a>{" "}
        genügt ebenfalls.
      </p>
      <div className="mt-10 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <KuendigungForm />
      </div>
    </section>
  );
}
