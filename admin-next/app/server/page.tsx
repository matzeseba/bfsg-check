import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockHealth, mockWorkflowRuns } from "@/lib/mock-data";
import { formatDateTime, formatUptime } from "@/lib/format";

export const metadata = {
  title: "Server-Status · Barrierefrei-Prüfen Admin",
};

function statusBadge(state: "ok" | "down" | "degraded") {
  switch (state) {
    case "ok":
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600">OK</Badge>
      );
    case "degraded":
      return <Badge variant="secondary">eingeschränkt</Badge>;
    case "down":
      return <Badge variant="destructive">ausgefallen</Badge>;
  }
}

function workflowBadge(
  status: "queued" | "in_progress" | "completed",
  conclusion: "success" | "failure" | "cancelled" | null,
) {
  if (status !== "completed") {
    return <Badge variant="secondary">{status}</Badge>;
  }
  if (conclusion === "success") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600">erfolgreich</Badge>
    );
  }
  if (conclusion === "failure") {
    return <Badge variant="destructive">fehlgeschlagen</Badge>;
  }
  return <Badge variant="outline">{conclusion ?? "—"}</Badge>;
}

export default function ServerPage() {
  const health = mockHealth;
  const runs = mockWorkflowRuns;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Server-Status</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Live-Check auf <code>https://barrierefrei-pruefen.de/health</code> sowie letzte
          GitHub-Workflow-Läufe.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Gesamtstatus</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {statusBadge(health.status)}
              <span className="text-base font-normal text-zinc-500">
                v{health.version}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Laufzeit</CardDescription>
            <CardTitle className="text-2xl">
              {formatUptime(health.uptimeSeconds)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Datenbank</CardDescription>
            <CardTitle>{statusBadge(health.checks.db)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>SMTP (Brevo) · Stripe</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {statusBadge(health.checks.smtp)}
              {statusBadge(health.checks.stripe)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="mb-3 text-lg font-medium">GitHub-Workflows</h2>
        {runs.length === 0 ? (
          <p className="rounded-md border bg-white p-4 text-sm text-zinc-500 dark:bg-zinc-900">
            Keine Läufe geladen. (Wird in Welle 5 über GitHub-API aktiviert,
            <code> GITHUB_TOKEN</code> nötig.)
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {runs.map((run) => (
              <Card key={run.id}>
                <CardHeader>
                  <CardTitle className="text-base">{run.name}</CardTitle>
                  <CardDescription>
                    Lauf #{run.id} · {formatDateTime(run.updatedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  {workflowBadge(run.status, run.conclusion)}
                  <a
                    href={run.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-700 hover:underline dark:text-sky-400"
                  >
                    auf GitHub öffnen
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
