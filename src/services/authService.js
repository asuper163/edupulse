// Local demo authentication — NOT production security. See EDUPULSE_AI_HANDOFF.md.
import { storageAdapter } from '../storage/storageAdapter';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { uid } from '../utils/format';

const SESSION_DAYS = 7;

export const authService = {
  login(email, password) {
    const users = storageAdapter.getCollection('users');
    const user = users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!user || user.password !== password) return { ok: false, error: 'invalid_credentials' };
    if (user.status !== 'active') return { ok: false, error: 'suspended' };
    const now = Date.now();
    storageAdapter.set(STORAGE_KEYS.session, { userId: user.id, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + SESSION_DAYS * 86400000).toISOString() });
    return { ok: true, user: { ...user, password: undefined } };
  },

  register({ name, email, password, role }) {
    if (!['student', 'instructor'].includes(role)) return { ok: false, error: 'invalid_role' };
    const users = storageAdapter.getCollection('users');
    const normalized = String(email).trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalized)) return { ok: false, error: 'email_exists' };
    const now = new Date().toISOString();
    const user = { id: uid('usr'), name: String(name).trim(), email: normalized, password, role, avatar: '', bio: '', phone: '', status: 'active', createdAt: now, updatedAt: now };
    storageAdapter.insertInCollection('users', user);
    storageAdapter.insertInCollection('settings', { id: uid('set'), userId: user.id, language: 'ar', notificationPreferences: { course: true, quiz: true, certificate: true, announcements: true }, preferences: {}, updatedAt: now });
    const login = this.login(normalized, password);
    return login.ok ? { ok: true, user: login.user } : { ok: true, user: { ...user, password: undefined } };
  },

  logout() {
    storageAdapter.remove(STORAGE_KEYS.session);
  },

  getSession() {
    const session = storageAdapter.get(STORAGE_KEYS.session, null);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      storageAdapter.remove(STORAGE_KEYS.session);
      return null;
    }
    return session;
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const user = storageAdapter.getCollection('users').find((u) => u.id === session.userId);
    if (!user || user.status !== 'active') {
      if (user && user.status !== 'active') this.logout();
      return null;
    }
    return { ...user, password: undefined };
  },

  updateProfile(userId, patch) {
    const allowed = ['name', 'bio', 'phone', 'avatar'];
    const clean = {};
    for (const k of allowed) if (patch[k] !== undefined) clean[k] = patch[k];
    clean.updatedAt = new Date().toISOString();
    const res = storageAdapter.updateInCollection('users', userId, (u) => ({ ...u, ...clean }));
    return res.ok ? { ...res.item, password: undefined } : null;
  },
};
