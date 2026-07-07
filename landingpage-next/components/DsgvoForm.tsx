"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Status = "idle" | "submitting" | "success" | "error";
type Action = "export" | "delete";

export function DsgvoForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [email, setEmail] = React.useState("");
  const [action, setAction] = React.useState<Action>("export");
  const [note, setNote] = React.useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/dsgvo/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action, note }),
      });
      if (!response.ok) throw new Error("api");
      setStatus("success");
      toast.success(
        "Anfrage eingegangen — Bearbeitung erfolgt binnen 30 Tagen (DSGVO).",
      );
    } catch {
      setStatus("error");
      toast.error(
        "Übermittlung fehlgeschlagen. Bitte E-Mail an info@bfsg-fix.de senden.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-6 text-sm">
        <p className="font-semibold">Anfrage eingegangen.</p>
        <p className="mt-2 text-muted-foreground">
          Zur Identitätsprüfung erhalten Sie eine Bestätigungs-E-Mail. Nach
          Bestätigung verarbeiten wir Ihre Anfrage gemäß Art. 12 DSGVO binnen
          30 Tagen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="ds-email">E-Mail-Adresse</Label>
        <Input
          id="ds-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <fieldset className="grid gap-2 rounded-md border border-border p-3">
        <legend className="px-1 text-xs text-muted-foreground">Anfrage</legend>
        <RadioGroup
          value={action}
          onValueChange={(value) => setAction(value as Action)}
          className="gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem id="ds-export" value="export" />
            <Label htmlFor="ds-export" className="font-normal">
              Datenauskunft (Art. 15 DSGVO)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="ds-delete" value="delete" />
            <Label htmlFor="ds-delete" className="font-normal">
              Löschung (Art. 17 DSGVO)
            </Label>
          </div>
        </RadioGroup>
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="ds-note">Anmerkung (optional)</Label>
        <textarea
          id="ds-note"
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2Icon className="animate-spin" />
            Wird übermittelt...
          </>
        ) : (
          "Anfrage absenden"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Wir bestätigen den Eingang per E-Mail. Aus Sicherheitsgründen erfolgt
        eine Identitätsprüfung, bevor wir Daten herausgeben oder löschen.
      </p>
    </form>
  );
}
