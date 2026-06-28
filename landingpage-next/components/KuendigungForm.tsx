"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "submitting" | "success" | "error";

export function KuendigungForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subscriptionId, setSubscriptionId] = React.useState("");
  const [effective, setEffective] = React.useState<"end_of_period" | "immediate">(
    "end_of_period",
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/kuendigung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend (scanner/app.js) erwartet { name, email, vertrag }.
        // vertrag = Abo-/Vertragsreferenz; effective ergaenzt den Wunschzeitpunkt.
        body: JSON.stringify({
          name,
          email,
          vertrag: subscriptionId,
          effective,
        }),
      });
      if (!response.ok) throw new Error("api");
      setStatus("success");
      toast.success(
        "Kündigung eingegangen — Bestätigung folgt per E-Mail.",
      );
    } catch {
      setStatus("error");
      toast.error(
        "Übermittlung fehlgeschlagen. Bitte E-Mail an kuendigen@barrierefrei-pruefen.de senden.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-6 text-sm">
        <p className="font-semibold">Kündigung eingegangen.</p>
        <p className="mt-2 text-muted-foreground">
          Sie erhalten innerhalb weniger Minuten eine schriftliche Bestätigung
          per E-Mail mit dem genauen Ende-Datum Ihres Abos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="kd-name">Name</Label>
        <Input
          id="kd-name"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="kd-email">E-Mail-Adresse (aus dem Abo)</Label>
        <Input
          id="kd-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="kd-sub">Abo-ID (falls bekannt)</Label>
        <Input
          id="kd-sub"
          placeholder="sub_…"
          value={subscriptionId}
          onChange={(event) => setSubscriptionId(event.target.value)}
        />
      </div>
      <fieldset className="grid gap-2 rounded-md border border-border p-3 text-sm">
        <legend className="px-1 text-xs text-muted-foreground">
          Zeitpunkt der Kündigung
        </legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="kd-effective"
            value="end_of_period"
            checked={effective === "end_of_period"}
            onChange={() => setEffective("end_of_period")}
          />
          <span>Zum Ende der laufenden Abrechnungsperiode</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="kd-effective"
            value="immediate"
            checked={effective === "immediate"}
            onChange={() => setEffective("immediate")}
          />
          <span>Sofort (keine anteilige Rückerstattung)</span>
        </label>
      </fieldset>
      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2Icon className="animate-spin" />
            Wird übermittelt...
          </>
        ) : (
          "Abo kündigen"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Die Kündigung ist jederzeit ohne Angabe von Gründen möglich. Bereits
        erbrachte Leistungen bleiben unberührt.
      </p>
    </form>
  );
}
