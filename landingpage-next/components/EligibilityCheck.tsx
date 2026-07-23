"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// Betroffenheits-Check — Asset D1 aus
// marketing/swarm-2026-07-23/agent-02-funnel-website.md (Branch
// feat/betroffenheits-check). Entscheidungsbaum als Schritt 0 im CheckoutModal:
// Beratungs-Modul, KEIN hartes Gate. Nicht-Betroffene werden sichtbar aktiv
// abgeraten (Leitplanke 6), dürfen aber freiwillig buchen (Override). Die
// Ersteinschätzung ist durchgehend als technische Orientierung ohne
// Rechtsberatung gelabelt, inkl. Fachanwalt-Verweis.

// Ergebnis-Werte, die als `eligibility`-Kontext an POST /api/checkout gehen
// (Backend-Whitelist in scanner/app.js). "unaffected_override" = Check hat
// "wahrscheinlich nicht betroffen" ergeben, Kunde bucht bewusst freiwillig.
export type EligibilityResult = "affected" | "unaffected_override" | "unsure";

// Fertige UI-Texte aus D1 (Copy-paste übernommen). Pflicht-Disclaimer IMMER
// sichtbar. Sprache: technische Ersteinschätzung, keine Rechtsberatung.
export const ELIGIBILITY_COPY = {
  kicker: "Kurzer Vor-Check (30 Sekunden)",
  title: "Betrifft das BFSG Ihr Angebot überhaupt?",
  intro:
    "Bevor Sie einen Report kaufen: Prüfen Sie in drei Fragen, ob Ihr Angebot " +
    "voraussichtlich unter das BFSG fällt. Wir raten Nicht-Betroffenen ehrlich vom Kauf ab. " +
    "Diese Ersteinschätzung ist eine technische Orientierung und keine Rechtsberatung.",

  questions: [
    {
      id: "q1",
      question: "Können Besucher auf Ihrer Website oder App etwas kaufen, buchen, bestellen oder einen Vertrag abschließen?",
      options: [
        { value: "yes", label: "Ja — Shop, Buchung, Bestellung oder Online-Abschluss" },
        { value: "no", label: "Nein — meine Website informiert nur (keine Kauf-/Buchungsfunktion)" },
      ],
    },
    {
      id: "q2", // nur wenn q1 = yes
      question: "Was bieten Sie dort an?",
      options: [
        { value: "products", label: "Waren oder digitale Produkte (Online-Shop, Downloads, Tickets)" },
        { value: "mixed", label: "Gemischt — Dienstleistungen und Produkte" },
        { value: "services", label: "Reine Dienstleistungen (z. B. Beratung, Handwerk, Terminbuchung)" },
      ],
    },
    {
      id: "q3a", // nur wenn q2 = services — Verbraucherbezug
      question: "Wer kann Ihre Dienstleistung online buchen oder kaufen?",
      options: [
        { value: "b2c", label: "Verbraucher oder Verbraucher und Unternehmen" },
        { value: "b2b", label: "Ausschließlich andere Unternehmen (kein Verbraucherkontakt)" },
      ],
    },
    {
      id: "q3b", // nur wenn q2 = services UND q3a = b2c — Kleinstunternehmen
      question: "Hat Ihr Unternehmen weniger als 10 Beschäftigte UND höchstens 2 Mio. € Jahresumsatz?",
      options: [
        { value: "yes", label: "Ja — wir sind ein Kleinstunternehmen" },
        { value: "no", label: "Nein" },
        { value: "unsure", label: "Unsicher" },
      ],
    },
  ],

  results: {
    affected: {
      tone: "good", // grünes Ergebnis
      headline: "Sehr wahrscheinlich betroffen",
      body:
        "Nach Ihren Angaben fällt Ihr Angebot voraussichtlich unter das BFSG: Sie verkaufen " +
        "oder vermitteln online an Verbraucher. Eine automatisierte technische Analyse Ihrer " +
        "Website nach WCAG 2.1 AA ist der sinnvolle nächste Schritt — Sie sehen in 60 Sekunden, " +
        "wo Sie stehen.",
      cta: "Verstanden — weiter zur Paketauswahl",
    },
    unaffected: {
      tone: "warn", // aktives Abraten (Leitplanke 6)
      headline: "Wahrscheinlich nicht betroffen — wir raten vom Kauf ab",
      body:
        "Nach Ihren Angaben fällt Ihr Angebot voraussichtlich NICHT unter das BFSG " +
        "(z. B. reine Informations-Website ohne Verkaufsfunktion, reines B2B-Angebot oder " +
        "Kleinstunternehmen mit reiner Dienstleistung). Einen BFSG-Report brauchen Sie dann " +
        "nicht — kaufen Sie ihn bitte nicht wegen einer Pflicht, die es für Sie vermutlich " +
        "nicht gibt. Barrierefreiheit lohnt sich trotzdem: für mehr Nutzer, bessere Bedienbarkeit " +
        "und bessere Auffindbarkeit. Wenn Sie Ihre Website freiwillig verbessern möchten, " +
        "dürfen Sie den Check natürlich trotzdem buchen.",
      ctaOverride: "Trotzdem freiwillig prüfen lassen",
      ctaBack: "Zurück zur Startseite",
      note:
        "Achtung bei Kleinstunternehmen: Sobald Sie auch nur ein Produkt online verkaufen, " +
        "gilt die Ausnahme nicht mehr. Im Zweifel klären Sie Ihre Einordnung mit einem " +
        "Fachanwalt für IT- oder Wettbewerbsrecht.",
    },
    unsure: {
      tone: "warn",
      headline: "Einordnung unklar",
      body:
        "Auf Ihre Konstellation passt keine eindeutige Antwort. Wir empfehlen: Klären Sie die " +
        "rechtliche Einordnung mit einem Fachanwalt für IT- oder Wettbewerbsrecht — wir geben " +
        "keine Rechtsberatung. Unabhängig davon können Sie die technische Analyse buchen: " +
        "Sie zeigt belegbare Mängel und Verbesserungspotenziale Ihrer Website nach WCAG 2.1 AA, " +
        "mit oder ohne gesetzliche Pflicht.",
      ctaOverride: "Technische Analyse trotzdem buchen",
      ctaBack: "Zurück zur Startseite",
    },
  },

  footer:
    "Diese Selbsteinschätzung wird nur als Kontext zu Ihrer Bestellung verarbeitet und nicht " +
    "zu Werbezwecken genutzt. Rechtsstand: Juli 2026. Keine Rechtsberatung.",
} as const;

type QuestionId = (typeof ELIGIBILITY_COPY.questions)[number]["id"];
type Answers = Partial<Record<QuestionId, string>>;
type Outcome = keyof typeof ELIGIBILITY_COPY.results;

// Rechtslogik (D1, Quellen: Marktfakten Stand Juli 2026): BFSG gilt für
// Produkte und Dienstleistungen im elektronischen Geschäftsverkehr mit
// Verbraucherbezug. Kleinstunternehmen (< 10 Beschäftigte UND ≤ 2 Mio. €
// Jahresumsatz) sind nur bei REINEN Dienstleistungen ausgenommen, nicht bei
// Produkten.
function evaluate(answers: Answers): Outcome | null {
  if (answers.q1 === "no") return "unaffected";
  if (answers.q1 !== "yes") return null;
  if (answers.q2 === "products" || answers.q2 === "mixed") return "affected";
  if (answers.q2 !== "services") return null;
  if (answers.q3a === "b2b") return "unaffected";
  if (answers.q3a !== "b2c") return null;
  if (answers.q3b === "yes") return "unaffected"; // Kleinstunternehmen-Ausnahme
  if (answers.q3b === "no") return "affected";
  if (answers.q3b === "unsure") return "unsure";
  return null;
}

// Fragen erscheinen progressiv untereinander; eine geänderte frühere Antwort
// setzt abhängige Folgeantworten zurück (Baum-Logik).
function visibleQuestions(answers: Answers) {
  const ids: QuestionId[] = ["q1"];
  if (answers.q1 === "yes") ids.push("q2");
  if (answers.q2 === "services") ids.push("q3a");
  if (answers.q3a === "b2c") ids.push("q3b");
  return ELIGIBILITY_COPY.questions.filter((q) => ids.includes(q.id));
}

export function EligibilityCheck({
  onDone,
  onBack,
}: {
  onDone: (result: EligibilityResult) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = React.useState<Answers>({});
  const outcome = evaluate(answers);

  function setAnswer(id: QuestionId, value: string) {
    setAnswers((prev) => {
      const next: Answers = { ...prev, [id]: value };
      if (id === "q1") {
        delete next.q2;
        delete next.q3a;
        delete next.q3b;
      } else if (id === "q2") {
        delete next.q3a;
        delete next.q3b;
      } else if (id === "q3a") {
        delete next.q3b;
      }
      return next;
    });
  }

  const copy = outcome ? ELIGIBILITY_COPY.results[outcome] : null;

  return (
    <div className="grid gap-4">
      {visibleQuestions(answers).map((q, index) => (
        <fieldset key={q.id} className="grid gap-2">
          <legend className="mb-1.5 text-sm font-medium leading-snug">
            <span className="text-muted-foreground">Frage {index + 1}:</span>{" "}
            {q.question}
          </legend>
          <RadioGroup
            value={answers[q.id]}
            onValueChange={(value) => setAnswer(q.id, value)}
            className="grid gap-2"
          >
            {q.options.map((option) => {
              const isSelected = answers[q.id] === option.value;
              return (
                <Label
                  key={option.value}
                  htmlFor={`elig-${q.id}-${option.value}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm font-normal leading-snug transition-colors",
                    isSelected
                      ? "border-brand-orange/60 bg-brand-orange/10"
                      : "border-border hover:border-brand-orange/30 hover:bg-muted/40",
                  )}
                >
                  <RadioGroupItem
                    id={`elig-${q.id}-${option.value}`}
                    value={option.value}
                    className="mt-0.5"
                  />
                  {option.label}
                </Label>
              );
            })}
          </RadioGroup>
        </fieldset>
      ))}

      {outcome && copy && (
        <div
          role="status"
          className={cn(
            "grid gap-2 rounded-lg border p-4",
            copy.tone === "good"
              ? "border-emerald-600/40 bg-emerald-500/10"
              : "border-amber-600/40 bg-amber-500/10",
          )}
        >
          <p className="text-sm font-semibold">{copy.headline}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.body}
          </p>
          {"note" in copy && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {copy.note}
            </p>
          )}
          <div className="mt-1 grid gap-2">
            <button
              type="button"
              className="btn-cta min-h-11 w-full px-4 py-2 text-sm whitespace-normal"
              onClick={() =>
                onDone(
                  outcome === "unaffected" ? "unaffected_override" : outcome,
                )
              }
            >
              {"cta" in copy ? copy.cta : copy.ctaOverride}
            </button>
            {"ctaBack" in copy && (
              <button
                type="button"
                className="mx-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={onBack}
              >
                {copy.ctaBack}
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        {ELIGIBILITY_COPY.footer}
      </p>
    </div>
  );
}
