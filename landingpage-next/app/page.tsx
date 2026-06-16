import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-background text-foreground">
      <section className="w-full max-w-5xl px-6 pt-24 pb-16 sm:pt-32">
        <Badge variant="outline" className="mb-6">
          BFSG ab 28. Juni 2025 verpflichtend
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          BFSG-Check — Prüfen, was wirklich zählt
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Automatischer Scan Ihrer Website auf Barrierefreiheits-Anforderungen
          nach dem Barrierefreiheitsstärkungsgesetz. Sie erhalten einen
          verständlichen Report mit konkretem Fix-Plan — bevor Behörden oder
          Mitbewerber Bußgelder auslösen.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg">Jetzt kostenlos scannen</Button>
          <Button size="lg" variant="outline">
            So funktioniert&apos;s
          </Button>
        </div>
      </section>

      <Separator className="my-8 max-w-5xl" />

      <section className="w-full max-w-5xl px-6 pb-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Was BFSG-Check für Sie übernimmt
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Automatischer Scan</CardTitle>
              <CardDescription>
                Wir prüfen Ihre Website gegen WCAG 2.1 AA und die
                BFSG-Anforderungen.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Inklusive Cookie-Banner, Kontraste, Tastaturbedienung und
              ARIA-Auszeichnungen.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verständlicher Fix-Plan</CardTitle>
              <CardDescription>
                Kein Audit-PDF, das niemand liest — Schritt-für-Schritt-Plan
                für Ihre Entwicklerinnen und Entwickler.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Priorisiert nach Risiko, mit Code-Snippets und geschätztem
              Aufwand.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Laufendes Monitoring</CardTitle>
              <CardDescription>
                Wöchentlicher Re-Check, damit neue Inhalte Sie nicht wieder
                aus der Compliance werfen.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Optional als Abo — jederzeit kündbar.
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="w-full border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BFSG-Check — bfsg-fix.de</p>
          <p>
            Stub-Seite. Die volle Landingpage folgt in der
            FRONTEND-COMPONENTS-Welle.
          </p>
        </div>
      </footer>
    </main>
  );
}
