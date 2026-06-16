import type { Metadata } from "next";

import { KuendigungForm } from "@/components/KuendigungForm";

export const metadata: Metadata = {
  title: "Abo kündigen",
  description:
    "Re-Check-Abo bei BFSG-Check jederzeit ohne Angabe von Gründen kündigen.",
  robots: { index: false, follow: true },
};

export default function KuendigenPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Abo kündigen
      </h1>
      <p className="mt-4 text-muted-foreground">
        Ihr Re-Check-Abo ist jederzeit zum Ende der laufenden Abrechnungsperiode
        kündbar — auf Wunsch auch sofort. Eine formlose E-Mail an{" "}
        <a href="mailto:kuendigen@bfsg-fix.de" className="underline">
          kuendigen@bfsg-fix.de
        </a>{" "}
        genügt ebenfalls.
      </p>
      <div className="mt-10">
        <KuendigungForm />
      </div>
    </section>
  );
}
