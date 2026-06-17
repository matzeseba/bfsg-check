"use client";

import { ArrowRightIcon, ShieldAlertIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCheckout } from "@/lib/checkout-context";

export type ScanResult = {
  score: number;
  totalIssues: number;
  topIssues?: string[];
  fallback?: boolean;
};

function gradeFor(score: number): {
  grade: string;
  variant: "default" | "secondary" | "destructive";
  verdict: string;
} {
  if (score >= 85) {
    return {
      grade: "A",
      variant: "default",
      verdict: "Solide Basis — wenige Restpunkte zu klären.",
    };
  }
  if (score >= 70) {
    return {
      grade: "B",
      variant: "secondary",
      verdict: "Solide Basis, aber Handlungsbedarf.",
    };
  }
  if (score >= 55) {
    return {
      grade: "C",
      variant: "secondary",
      verdict: "Mehrere Mängel — erhöhtes Beschwerderisiko.",
    };
  }
  return {
    grade: "D",
    variant: "destructive",
    verdict: "Deutliche Mängel — erhöhtes Abmahnrisiko.",
  };
}

export function ResultCard({ result }: { result: ScanResult }) {
  const { score, totalIssues, topIssues, fallback } = result;
  const { grade, variant, verdict } = gradeFor(score);
  const { openCheckout } = useCheckout();
  const positive = score >= 75;

  return (
    <Card aria-live="polite" className="border-2">
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          {positive ? (
            <ShieldCheckIcon className="size-6 text-primary" />
          ) : (
            <ShieldAlertIcon className="size-6 text-destructive" />
          )}
        </div>
        <div>
          <CardTitle className="text-lg">
            {score}/100 — Note {grade}
          </CardTitle>
          <CardDescription>{verdict}</CardDescription>
        </div>
        <Badge variant={variant}>{totalIssues} Funde</Badge>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm font-medium">
          Top-Befunde aus der Sofort-Prüfung
        </p>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          {(topIssues && topIssues.length > 0
            ? topIssues
            : [
                "Fehlende Alt-Texte bei Bildern",
                "Unzureichende Farbkontraste",
                "Formularfelder ohne sichtbares Label",
              ]
          )
            .slice(0, 3)
            .map((issue) => (
              <li key={issue} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-destructive"
                />
                <span>{issue}</span>
              </li>
            ))}
        </ul>
        {fallback && (
          <p className="text-xs text-muted-foreground">
            Hinweis: Demo-Werte — der Live-Backend-Scan war nicht erreichbar.
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Vollreport mit jedem Mangel + fertiger Erklärung
        </p>
        <Button onClick={() => openCheckout("profi")}>
          Vollreport sichern
          <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
