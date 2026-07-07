// Zentrale Pfad-/Runtime-Konfiguration. Alle Module beziehen ihre Pfade hierüber,
// damit Tests mit isolierten Verzeichnissen laufen können (overrides).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)); // .../engine/src
const engineRoot = path.resolve(here, '..'); // .../engine
const mosRootDefault = path.resolve(engineRoot, '..'); // .../marketing-os
const repoRootDefault = path.resolve(mosRootDefault, '..'); // Repo-Wurzel

export const VERSION = '1.0.0';

/**
 * Baut ein Config-Objekt. `overrides` gewinnen vor ENV, ENV gewinnt vor Defaults.
 * Wichtig für Tests: dataDir/seedDir/playbooksDir etc. sind überschreibbar.
 */
export function createConfig(overrides = {}) {
  const mosRoot = overrides.mosRoot || mosRootDefault;
  const repoRoot = overrides.repoRoot || repoRootDefault;
  const dataDir = overrides.dataDir || process.env.MOS_DATA_DIR || path.join(mosRoot, 'data');

  return {
    version: VERSION,
    repoRoot,
    mosRoot,
    dataDir,
    seedDir: overrides.seedDir || path.join(dataDir, 'seed'),
    outboxDir: overrides.outboxDir || path.join(dataDir, 'outbox'),
    logsDir: overrides.logsDir || path.join(dataDir, 'logs'),
    agentsDir: overrides.agentsDir || path.join(mosRoot, 'agents'),
    playbooksDir: overrides.playbooksDir || path.join(mosRoot, 'playbooks'),
    policyPath: overrides.policyPath || path.join(mosRoot, 'policy', 'compliance.json'),
    dashboardDist: overrides.dashboardDist || path.join(mosRoot, 'dashboard', 'dist'),
    dryRun: overrides.dryRun ?? (process.env.MOS_DRY_RUN === '1'),
    port: overrides.port ?? (process.env.MOS_PORT ? Number(process.env.MOS_PORT) : 4870),
    // Produkt-Fakten für Prompt-Platzhalter
    product: overrides.product || 'BFSG-Fuchs',
    domain: overrides.domain || 'bfsg-fix.de',
  };
}
