// Local in-app notifications (no real email/SMS).
import { storageAdapter } from '../storage/storageAdapter';
import { uid } from '../utils/format';

export const notificationService = {
  create({ userId, userIds, title, message, type = 'system' }) {
    const targets = userIds || (userId ? [userId] : []);
    const now = new Date().toISOString();
    const created = targets.map((id) => ({ id: uid('ntf'), userId: id, title: typeof title === 'string' ? { ar: title, en: title } : title, message: typeof message === 'string' ? { ar: message, en: message } : message, type, isRead: false, createdAt: now }));
    const existing = storageAdapter.getCollection('notifications');
    storageAdapter.setCollection('notifications', [...created, ...existing]);
    return created;
  },

  createForAudience(audience, { title, message, type = 'announcement' }) {
    const users = storageAdapter.getCollection('users');
    const targets = users.filter((u) => (audience === 'all' ? true : u.role === audience)).map((u) => u.id);
    return this.create({ userIds: targets, title, message, type });
  },

  getForUser(userId) {
    return storageAdapter.getCollection('notifications').filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  unreadCount(userId) {
    return this.getForUser(userId).filter((n) => !n.isRead).length;
  },

  markRead(id) {
    return storageAdapter.updateInCollection('notifications', id, { isRead: true }).ok;
  },

  markAllRead(userId) {
    const all = storageAdapter.getCollection('notifications');
    storageAdapter.setCollection('notifications', all.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)));
  },

  remove(id) {
    storageAdapter.removeFromCollection('notifications', (n) => n.id === id);
  },
};
