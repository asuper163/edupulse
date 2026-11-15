// Initializes the demo dataset on first run and owns schema migrations.
import { storageAdapter } from './storageAdapter';
import { STORAGE_KEYS, SCHEMA_VERSION } from './storageKeys';
import { generateSeedData } from '../data/seed';

export function initializeStorage() {
  const currentVersion = storageAdapter.get(STORAGE_KEYS.schemaVersion, null);
  const users = storageAdapter.get(STORAGE_KEYS.users, null);
  if (currentVersion === SCHEMA_VERSION && Array.isArray(users)) {
    return { seeded: false, version: currentVersion };
  }
  // One-time migration / fresh install: wipe old artifacts, then seed deterministically.
  console.warn('[EDUPULSE] storage reseeded — schema', currentVersion, '→', SCHEMA_VERSION, '| users valid:', Array.isArray(users));
  storageAdapter.resetAllData();
  const seed = generateSeedData();
  for (const [name, items] of Object.entries(seed)) {
    storageAdapter.setCollection(name, items);
  }
  storageAdapter.set(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
  return { seeded: true, version: SCHEMA_VERSION };
}

export function resetDemoData() {
  storageAdapter.resetAllData();
  return initializeStorage();
}
