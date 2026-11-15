// Review queries & moderation. Averages exclude hidden reviews.
import { storageAdapter } from '../storage/storageAdapter';
import { uid } from '../utils/format';

export const reviewService = {
  getForCourse(courseId, { includeHidden = false } = {}) {
    const list = storageAdapter.getCollection('reviews').filter((r) => r.courseId === courseId);
    return (includeHidden ? list : list.filter((r) => r.status === 'visible')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAll({ query = '', rating = 0, status = '' } = {}) {
    let list = storageAdapter.getCollection('reviews').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (status) list = list.filter((r) => r.status === status);
    if (rating) list = list.filter((r) => r.rating === rating);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((r) => String(r.comment || '').toLowerCase().includes(q));
    }
    return list;
  },

  averageForCourse(courseId) {
    const visible = this.getForCourse(courseId);
    if (!visible.length) return { average: 0, count: 0 };
    return { average: visible.reduce((s, r) => s + r.rating, 0) / visible.length, count: visible.length };
  },

  getUserReview(studentId, courseId) {
    return storageAdapter.getCollection('reviews').find((r) => r.studentId === studentId && r.courseId === courseId) || null;
  },

  create({ studentId, courseId, rating, comment }) {
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return { ok: false, error: 'invalid_rating' };
    const enrollments = storageAdapter.getCollection('enrollments');
    if (!enrollments.some((e) => e.studentId === studentId && e.courseId === courseId)) return { ok: false, error: 'not_enrolled' };
    const existing = this.getUserReview(studentId, courseId);
    if (existing) return { ok: false, error: 'duplicate', review: existing };
    const now = new Date().toISOString();
    const review = { id: uid('rev'), studentId, courseId, rating: r, comment: String(comment || '').trim(), status: 'visible', createdAt: now, updatedAt: now };
    storageAdapter.insertInCollection('reviews', review);
    return { ok: true, review };
  },

  setStatus(id, status) {
    return storageAdapter.updateInCollection('reviews', id, { status, updatedAt: new Date().toISOString() }).ok;
  },

  remove(id) {
    storageAdapter.removeFromCollection('reviews', (r) => r.id === id);
  },
};
