// Safe LocalStorage adapter + backup export/import/reset logic.
// All reads/writes in the app go through this module.
import { STORAGE_KEYS, SCHEMA_VERSION, ARRAY_KEYS, ALL_DATA_KEYS } from './storageKeys';

function safeParse(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const storageAdapter = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return safeParse(raw, fallback);
    } catch {
      return fallback; // storage unavailable (private mode, quota, disabled)
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.name === 'QuotaExceededError' ? 'quota' : 'write' };
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  getCollection(name) {
    const key = STORAGE_KEYS[name];
    if (!key) throw new Error(`Unknown collection: ${name}`);
    const value = this.get(key, []);
    return Array.isArray(value) ? value : [];
  },

  setCollection(name, items) {
    const key = STORAGE_KEYS[name];
    if (!key) throw new Error(`Unknown collection: ${name}`);
    return this.set(key, Array.isArray(items) ? items : []);
  },

  // Update one entity in a collection (immutably)
  updateInCollection(name, id, updater) {
    const items = this.getCollection(name);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return { ok: false, error: 'not_found' };
    const updated = typeof updater === 'function' ? updater(items[idx]) : { ...items[idx], ...updater };
    const next = [...items];
    next[idx] = updated;
    this.setCollection(name, next);
    return { ok: true, item: updated };
  },

  insertInCollection(name, entity) {
    const items = this.getCollection(name);
    this.setCollection(name, [...items, entity]);
    return entity;
  },

  removeFromCollection(name, predicate) {
    const items = this.getCollection(name);
    const next = items.filter((i) => !predicate(i));
    this.setCollection(name, next);
    return items.length - next.length;
  },

  // ── Backup: export / validate / import / reset ──────────────────────
  exportBackup() {
    const data = {};
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      if (name === 'schemaVersion' || name === 'session') continue;
      data[name] = this.getCollection(name);
    }
    return {
      app: 'EDUPULSE',
      type: 'backup',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
      data,
    };
  },

  validateBackup(payload) {
    if (!payload || typeof payload !== 'object') return { valid: false, reason: 'not_json_object' };
    if (payload.app !== 'EDUPULSE' || payload.type !== 'backup') return { valid: false, reason: 'not_edupulse_backup' };
    if (payload.schemaVersion !== SCHEMA_VERSION) return { valid: false, reason: 'schema_mismatch' };
    if (!payload.data || typeof payload.data !== 'object') return { valid: false, reason: 'missing_data' };
    for (const name of ARRAY_KEYS) {
      const value = payload.data[name];
      if (value !== undefined && !Array.isArray(value)) return { valid: false, reason: `invalid_collection:${name}` };
    }
    // Minimal referential sanity: users and courses must be arrays if present
    if (!Array.isArray(payload.data.users) || !Array.isArray(payload.data.courses)) {
      return { valid: false, reason: 'missing_core_collections' };
    }
    return { valid: true };
  },

  importBackup(payload) {
    const check = this.validateBackup(payload);
    if (!check.valid) return { ok: false, reason: check.reason };
    // Write everything only after successful validation — current data stays intact on failure.
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      if (name === 'schemaVersion' || name === 'session') continue;
      this.set(key, Array.isArray(payload.data[name]) ? payload.data[name] : []);
    }
    this.set(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
    return { ok: true };
  },

  resetAllData() {
    for (const key of ALL_DATA_KEYS) this.remove(key);
  },

  approxUsageBytes() {
    let total = 0;
    for (const key of ALL_DATA_KEYS) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) total += raw.length * 2; // UTF-16 code units
      } catch { /* ignore */ }
    }
    return total;
  },
};
