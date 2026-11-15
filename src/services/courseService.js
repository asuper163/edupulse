// Course CRUD, approval workflow, and course-level statistics.
import { storageAdapter } from '../storage/storageAdapter';
import { notificationService } from './notificationService';
import { reviewService } from './reviewService';
import { uid, slugify } from '../utils/format';

const nowIso = () => new Date().toISOString();

function decorate(course) {
  const sections = storageAdapter.getCollection('sections').filter((s) => s.courseId === course.id);
  const sectionIds = sections.map((s) => s.id);
  const lessons = storageAdapter.getCollection('lessons').filter((l) => sectionIds.includes(l.sectionId));
  const enrollments = storageAdapter.getCollection('enrollments').filter((e) => e.courseId === course.id);
  const { average, count } = reviewService.averageForCourse(course.id);
  const category = storageAdapter.getCollection('categories').find((c) => c.id === course.categoryId);
  return {
    ...course,
    categoryName: category?.name || null,
    sectionCount: sections.length,
    lessonCount: lessons.length,
    enrollmentCount: enrollments.length,
    completionCount: enrollments.filter((e) => e.status === 'completed').length,
    avgRating: average,
    reviewCount: count,
    totalDuration: lessons.reduce((s, l) => s + Number(l.duration || 0), 0),
  };
}

export const courseService = {
  getById(id) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === id);
    return course ? decorate(course) : null;
  },

  getAll() {
    return storageAdapter.getCollection('courses').map(decorate);
  },

  getPublished() {
    return this.getAll().filter((c) => c.status === 'published');
  },

  getFeatured(limit = 6) {
    return this.getPublished().sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, limit);
  },

  getByInstructor(instructorId) {
    return this.getAll().filter((c) => c.instructorId === instructorId);
  },

  getByCategory(categoryId) {
    return this.getPublished().filter((c) => c.categoryId === categoryId);
  },

  searchFilter({ query = '', categoryId = '', instructorId = '', difficulty = '', minRating = 0, sort = 'newest', status = 'published' } = {}) {
    let list = status === 'all' ? this.getAll() : this.getAll().filter((c) => c.status === status);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => [c.title?.ar, c.title?.en, c.shortDescription?.ar, c.shortDescription?.en, c.slug].filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    if (categoryId) list = list.filter((c) => c.categoryId === categoryId);
    if (instructorId) list = list.filter((c) => c.instructorId === instructorId);
    if (difficulty) list = list.filter((c) => c.difficulty === difficulty);
    if (minRating) list = list.filter((c) => c.avgRating >= minRating);
    switch (sort) {
      case 'popular': list.sort((a, b) => b.enrollmentCount - a.enrollmentCount); break;
      case 'rating': list.sort((a, b) => b.avgRating - a.avgRating); break;
      case 'title': list.sort((a, b) => (a.title?.en || '').localeCompare(b.title?.en || '')); break;
      default: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  },

  // ── Curriculum helpers ──────────────────────────────────────────────
  getCurriculum(courseId) {
    const sections = storageAdapter.getCollection('sections').filter((s) => s.courseId === courseId).sort((a, b) => a.order - b.order);
    const lessons = storageAdapter.getCollection('lessons');
    return sections.map((s) => ({ ...s, lessons: lessons.filter((l) => l.sectionId === s.id).sort((a, b) => a.order - b.order) }));
  },

  // ── Mutations with permission checks ────────────────────────────────
  create(data, { requesterId, requesterRole }) {
    if (!['instructor', 'admin'].includes(requesterRole)) return { ok: false, error: 'forbidden' };
    const now = nowIso();
    const course = {
      id: uid('crs'),
      title: data.title, shortDescription: data.shortDescription, description: data.description,
      slug: slugify(data.title?.en || data.title?.ar || 'course'),
      thumbnail: data.thumbnail || '',
      instructorId: requesterRole === 'admin' && data.instructorId ? data.instructorId : requesterId,
      categoryId: data.categoryId, difficulty: data.difficulty || 'beginner',
      learningObjectives: data.learningObjectives || { ar: [], en: [] },
      prerequisites: data.prerequisites || { ar: [], en: [] },
      estimatedDuration: Number(data.estimatedDuration) || 6,
      estimatedHours: Number(data.estimatedHours) || 40,
      projectCount: Number(data.projectCount) || 0,
      price: Number(data.price) || 0,
      discount: Number(data.discount) || 0,
      requirements: data.requirements || { ar: [], en: [] },
      status: 'draft', rejectionReason: null, featured: false,
      createdAt: now, updatedAt: now, submittedAt: null, publishedAt: null,
    };
    storageAdapter.insertInCollection('courses', course);
    return { ok: true, course };
  },

  update(courseId, patch, { requesterId, requesterRole }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (requesterRole !== 'admin' && course.instructorId !== requesterId) return { ok: false, error: 'forbidden' };
    if (requesterRole === 'instructor' && ['published'].includes(course.status)) {
      // Instructors may edit published courses' content but keep status; keep it simple: allowed.
    }
    const clean = { ...patch, updatedAt: nowIso() };
    delete clean.id; delete clean.instructorId; delete clean.status; delete clean.createdAt;
    if (requesterRole === 'admin' && patch.instructorId) clean.instructorId = patch.instructorId;
    const res = storageAdapter.updateInCollection('courses', courseId, (c) => ({ ...c, ...clean }));
    return res.ok ? { ok: true, course: decorate(res.item) } : { ok: false, error: 'update_failed' };
  },

  submitForApproval(courseId, { requesterId, requesterRole }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (requesterRole !== 'admin' && course.instructorId !== requesterId) return { ok: false, error: 'forbidden' };
    if (!['draft', 'rejected'].includes(course.status)) return { ok: false, error: 'invalid_status' };
    storageAdapter.updateInCollection('courses', courseId, { status: 'pending', submittedAt: nowIso(), updatedAt: nowIso() });
    const admins = storageAdapter.getCollection('users').filter((u) => u.role === 'admin');
    notificationService.create({ userIds: admins.map((a) => a.id), title: { ar: 'دورة بانتظار المراجعة', en: 'Course awaiting review' }, message: { ar: `أُرسلت دورة «${course.title?.ar}» للمراجعة.`, en: `Course “${course.title?.en}” was submitted for review.` }, type: 'approval' });
    return { ok: true };
  },

  approve(courseId, { requesterRole }) {
    if (requesterRole !== 'admin') return { ok: false, error: 'forbidden' };
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (course.status !== 'pending') return { ok: false, error: 'invalid_status' };
    storageAdapter.updateInCollection('courses', courseId, { status: 'published', publishedAt: nowIso(), rejectionReason: null, updatedAt: nowIso() });
    notificationService.create({ userId: course.instructorId, title: { ar: 'تمت الموافقة على دورتك', en: 'Your course was approved' }, message: { ar: `أصبحت دورة «${course.title?.ar}» منشورة ومتاحة للجميع.`, en: `“${course.title?.en}” is now published and live.` }, type: 'approval' });
    return { ok: true };
  },

  reject(courseId, reason, { requesterRole }) {
    if (requesterRole !== 'admin') return { ok: false, error: 'forbidden' };
    const ar = String(reason?.ar || '').trim();
    const en = String(reason?.en || '').trim();
    if (!ar || !en) return { ok: false, error: 'reason_required' };
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    storageAdapter.updateInCollection('courses', courseId, { status: 'rejected', rejectionReason: { ar, en }, updatedAt: nowIso() });
    notificationService.create({ userId: course.instructorId, title: { ar: 'تم رفض دورتك', en: 'Your course was rejected' }, message: { ar: `سبب الرفض: ${ar}`, en: `Reason: ${en}` }, type: 'rejection' });
    return { ok: true };
  },

  setStatus(courseId, status, { requesterRole }) {
    if (!['admin', 'instructor'].includes(requesterRole)) return { ok: false, error: 'forbidden' };
    const allowedTargets = requesterRole === 'admin' ? ['archived', 'published', 'pending', 'draft'] : ['archived'];
    if (!allowedTargets.includes(status)) return { ok: false, error: 'forbidden' };
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (requesterRole === 'instructor' && course.instructorId !== requesterId) return { ok: false, error: 'forbidden' };
    storageAdapter.updateInCollection('courses', courseId, { status, updatedAt: nowIso() });
    return { ok: true };
  },

  archive(courseId, { requesterId, requesterRole }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (requesterRole !== 'admin' && course.instructorId !== requesterId) return { ok: false, error: 'forbidden' };
    storageAdapter.updateInCollection('courses', courseId, { status: 'archived', updatedAt: nowIso() });
    return { ok: true };
  },

  // Admins can restore any archived course; instructors can restore only their own.
  // Both restore to 'draft' — content must be re-approved before publishing again.
  restore(courseId, { requesterId, requesterRole }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (requesterRole !== 'admin' && course.instructorId !== requesterId) return { ok: false, error: 'forbidden' };
    storageAdapter.updateInCollection('courses', courseId, { status: 'draft', updatedAt: nowIso() });
    return { ok: true };
  },

  // Instructor-owned delete: archives when enrollments exist; cascades otherwise.
  remove(courseId, { requesterId, requesterRole }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (requesterRole !== 'admin' && course.instructorId !== requesterId) return { ok: false, error: 'forbidden' };
    const hasEnrollments = storageAdapter.getCollection('enrollments').some((e) => e.courseId === courseId);
    if (hasEnrollments && requesterRole !== 'admin') {
      storageAdapter.updateInCollection('courses', courseId, { status: 'archived', updatedAt: nowIso() });
      return { ok: true, archived: true };
    }
    if (requesterRole === 'admin' && hasEnrollments) {
      // Admin delete also archives to preserve history
      storageAdapter.updateInCollection('courses', courseId, { status: 'archived', updatedAt: nowIso() });
      return { ok: true, archived: true };
    }
    const sectionIds = storageAdapter.getCollection('sections').filter((s) => s.courseId === courseId).map((s) => s.id);
    const quizIds = storageAdapter.getCollection('quizzes').filter((q) => q.courseId === courseId).map((q) => q.id);
    storageAdapter.removeFromCollection('questions', (q) => quizIds.includes(q.quizId));
    storageAdapter.removeFromCollection('quizAttempts', (a) => quizIds.includes(a.quizId));
    storageAdapter.removeFromCollection('quizzes', (q) => q.courseId === courseId);
    storageAdapter.removeFromCollection('lessonProgress', (p) => p.courseId === courseId);
    storageAdapter.removeFromCollection('lessons', (l) => sectionIds.includes(l.sectionId));
    storageAdapter.removeFromCollection('sections', (s) => s.courseId === courseId);
    storageAdapter.removeFromCollection('reviews', (r) => r.courseId === courseId);
    storageAdapter.removeFromCollection('wishlist', (w) => w.courseId === courseId);
    storageAdapter.removeFromCollection('courses', (c) => c.id === courseId);
    return { ok: true, archived: false };
  },
};
