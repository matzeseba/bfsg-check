// Demo-Ehrlichkeit: Meta-Statistik + Filterung für Datensätze mit optionalem `demo`-Flag.
// Seed-Daten (data/seed/kpis.json, data/seed/leads.json) tragen `demo: true`, damit das
// Dashboard erfundene Zahlen sichtbar von echten Daten unterscheiden kann.

/** Zählt Demo-/Gesamteinträge einer Liste. */
export function demoMeta(items) {
  const totalCount = items.length;
  const demoCount = items.filter((i) => i && i.demo === true).length;
  return { hasDemo: demoCount > 0, demoCount, totalCount };
}

/** Filtert Demo-Einträge raus, wenn includeDemo=false. */
export function filterDemo(items, includeDemo) {
  if (includeDemo) return items;
  return items.filter((i) => !(i && i.demo === true));
}

/** Liest den `includeDemo`-Query-Parameter (Default true, nur "false" schaltet aus). */
export function parseIncludeDemo(query) {
  return query?.includeDemo !== 'false';
}
