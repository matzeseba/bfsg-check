"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "submitting" | "success" | "error";

export function WiderrufForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [orderId, setOrderId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState("");
  const [reason, setReason] = React.useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/widerruf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend (scanner/app.js) erwartet { name, email, vertrag, datum }.
        // vertrag = Bestell-/Rechnungsnummer, datum = Bestelldatum.
        body: JSON.stringify({
          name,
          email,
          vertrag: orderId,
          datum: orderDate,
          reason,
        }),
      });
      if (!response.ok) throw new Error("api");
      setStatus("success");
      toast.success("Widerruf eingegangen — wir melden uns binnen 24 Stunden.");
    } catch {
      setStatus("error");
      toast.error(
        "Übermittlung fehlgeschlagen. Bitte E-Mail an widerruf@barrierefrei-pruefen.de senden.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-6 text-sm">
        <p className="font-semibold">Vielen Dank — Ihr Widerruf ist eingegangen.</p>
        <p className="mt-2 text-muted-foreground">
          Wir bestätigen den Eingang automatisch per E-Mail. Eine Rückzahlung
          erfolgt — sofern die Leistung noch nicht vollständig erbracht wurde —
          binnen 14 Tagen über das ursprüngliche Zahlungsmittel.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="wd-name">Name</Label>
        <Input
          id="wd-name"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="wd-email">E-Mail-Adresse (aus der Bestellung)</Label>
        <Input
          id="wd-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="wd-order">Bestell-ID / Rechnungsnummer</Label>
        <Input
          id="wd-order"
          required
          placeholder="z. B. cs_test_…"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="wd-date">Bestelldatum</Label>
        <Input
          id="wd-date"
          type="date"
          value={orderDate}
          onChange={(event) => setOrderDate(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="wd-reason">Grund (optional)</Label>
        <textarea
          id="wd-reason"
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2Icon className="animate-spin" />
            Wird übermittelt...
          </>
        ) : (
          "Widerruf erklären"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Hinweis: Bei digitalen Inhalten, deren sofortige Ausführung Sie im
        Checkout ausdrücklich verlangt haben, erlischt das Widerrufsrecht mit
        vollständiger Vertragserfüllung.
      </p>
    </form>
  );
}
