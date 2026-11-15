// Admin user management with safe-deletion rules.
import { storageAdapter } from '../storage/storageAdapter';
import { uid } from '../utils/format';

export const userService = {
  getAll({ query = '', role = '', status = '' } = {}) {
    let list = storageAdapter.getCollection('users').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (role) list = list.filter((u) => u.role === role);
    if (status) list = list.filter((u) => u.status === status);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((u) => [u.name, u.email].join(' ').toLowerCase().includes(q));
    }
    return list.map(({ password, ...u }) => u);
  },

  getById(id) {
    const u = storageAdapter.getCollection('users').find((x) => x.id === id);
    if (!u) return null;
    const { password, ...safe } = u;
    return safe;
  },

  // Admin-only: returns the full user record including the stored (demo) password.
  // The shipped demo dataset stores passwords in plain text by design — used for the admin's reveal/edit capability.
  getPrivateById(id) {
    return storageAdapter.getCollection('users').find((x) => x.id === id) || null;
  },

  create({ name, email, password, role, status }) {
    const normalized = String(email).trim().toLowerCase();
    const users = storageAdapter.getCollection('users');
    if (users.some((u) => u.email.toLowerCase() === normalized)) return { ok: false, error: 'email_exists' };
    const now = new Date().toISOString();
    const user = { id: uid('usr'), name: String(name).trim(), email: normalized, password: password || 'Demo123', role: role || 'student', avatar: '', bio: '', phone: '', status: status || 'active', createdAt: now, updatedAt: now };
    storageAdapter.insertInCollection('users', user);
    return { ok: true, user: this.getById(user.id) };
  },

  update(id, patch) {
    const clean = { ...patch, updatedAt: new Date().toISOString() };
    delete clean.id; delete clean.createdAt;
    const res = storageAdapter.updateInCollection('users', id, (u) => ({ ...u, ...clean }));
    return res.ok ? { ok: true, user: this.getById(id) } : { ok: false, error: 'not_found' };
  },

  setStatus(id, status) {
    return storageAdapter.updateInCollection('users', id, { status, updatedAt: new Date().toISOString() }).ok;
  },

  // Safe delete: blocked when the user has courses or enrollments (history must remain intact)
  remove(id) {
    const courses = storageAdapter.getCollection('courses').filter((c) => c.instructorId === id);
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => e.studentId === id);
    if (courses.length || enrollments.length) return { ok: false, error: 'has_relations' };
    storageAdapter.removeFromCollection('notifications', (n) => n.userId === id);
    storageAdapter.removeFromCollection('wishlist', (w) => w.studentId === id);
    storageAdapter.removeFromCollection('settings', (s) => s.userId === id);
    storageAdapter.removeFromCollection('quizAttempts', (a) => a.studentId === id);
    storageAdapter.removeFromCollection('lessonProgress', (p) => p.studentId === id);
    storageAdapter.removeFromCollection('certificates', (c) => c.studentId === id);
    storageAdapter.removeFromCollection('reviews', (r) => r.studentId === id);
    storageAdapter.removeFromCollection('users', (u) => u.id === id);
    return { ok: true };
  },

  counts() {
    const users = storageAdapter.getCollection('users');
    return {
      total: users.length,
      students: users.filter((u) => u.role === 'student').length,
      instructors: users.filter((u) => u.role === 'instructor').length,
      admins: users.filter((u) => u.role === 'admin').length,
    };
  },
};
