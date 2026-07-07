// Test-Helfer: isolierte Temp-Verzeichnisse + kleine Fixtures.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function mkTmp(prefix = 'mos-test-') {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function rmTmp(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // ignorieren
  }
}

/** Legt ein playbooks/-Verzeichnis mit den gegebenen Playbook-Objekten an. */
export async function writePlaybooks(dir, playbooks) {
  await fs.mkdir(dir, { recursive: true });
  for (const pb of playbooks) {
    await fs.writeFile(path.join(dir, `${pb.id}.json`), JSON.stringify(pb, null, 2), 'utf8');
  }
  return dir;
}

/** Fake-Executor, der einen festen String liefert (oder wirft). */
export function fakeExecutor(output, { throwError = false } = {}) {
  return async () => {
    if (throwError) throw new Error(typeof output === 'string' ? output : 'executor-fehler');
    return typeof output === 'function' ? output() : output;
  };
}
