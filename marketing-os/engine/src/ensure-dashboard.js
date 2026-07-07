// prestart-Helfer: baut dashboard/dist, falls es noch fehlt. Best-effort — ein Fehlschlag
// hier darf `npm start` nicht blockieren (Engine läuft auch ohne gebautes Dashboard, nur
// ohne statisches Ausliefern, siehe api.js "Statisches Dashboard (falls gebaut)").
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url)); // .../engine/src
const dashboardDir = path.resolve(here, '..', '..', 'dashboard');
const distIndex = path.join(dashboardDir, 'dist', 'index.html');

if (existsSync(distIndex)) {
  // eslint-disable-next-line no-console
  console.log('[MOS] dashboard/dist vorhanden — überspringe Build.');
  process.exit(0);
}

if (!existsSync(dashboardDir)) {
  // eslint-disable-next-line no-console
  console.log('[MOS] dashboard/ nicht gefunden — überspringe Build.');
  process.exit(0);
}

// eslint-disable-next-line no-console
console.log('[MOS] dashboard/dist fehlt — baue einmalig (npm run build in dashboard/)...');
const isWin = process.platform === 'win32';
const result = spawnSync(isWin ? 'npm.cmd' : 'npm', ['run', 'build'], {
  cwd: dashboardDir,
  stdio: 'inherit',
  shell: isWin,
});

if (result.status !== 0) {
  // eslint-disable-next-line no-console
  console.warn('[MOS] Dashboard-Build fehlgeschlagen — Engine startet trotzdem (ohne statisches Dashboard).');
}
process.exit(0);
