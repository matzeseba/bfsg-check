/**
 * Formatierungs-Helfer (de-DE).
 */

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const datetime = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCents(cents: number, currency = "EUR"): string {
  if (currency !== "EUR") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
    }).format(cents / 100);
  }
  return eur.format(cents / 100);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return datetime.format(new Date(iso));
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} T ${hours} Std`;
  if (hours > 0) return `${hours} Std ${minutes} Min`;
  return `${minutes} Min`;
}
