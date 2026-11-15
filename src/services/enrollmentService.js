// Enrollment logic — free courses, no duplicates, published-only.
import { storageAdapter } from '../storage/storageAdapter';
import { notificationService } from './notificationService';
import { uid } from '../utils/format';

export const enrollmentService = {
  enroll({ studentId, courseId }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (course.status !== 'published') return { ok: false, error: 'not_published' };
    const existing = this.getEnrollment(studentId, courseId);
    if (existing) return { ok: false, error: 'duplicate', enrollment: existing };
    const enrollment = { id: uid('enr'), studentId, courseId, enrolledAt: new Date().toISOString(), status: 'active', completedAt: null };
    storageAdapter.insertInCollection('enrollments', enrollment);
    notificationService.create({ userId: studentId, title: { ar: 'تم تسجيلك في الدورة', en: 'You enrolled in the course' }, message: { ar: `بدأت رحلة التعلم في «${course.title?.ar}». بالتوفيق!`, en: `Your journey in “${course.title?.en}” has begun. Good luck!` }, type: 'enrollment' });
    return { ok: true, enrollment };
  },

  getEnrollment(studentId, courseId) {
    return storageAdapter.getCollection('enrollments').find((e) => e.studentId === studentId && e.courseId === courseId) || null;
  },

  getByStudent(studentId) {
    return storageAdapter.getCollection('enrollments').filter((e) => e.studentId === studentId).sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
  },

  getByCourse(courseId) {
    return storageAdapter.getCollection('enrollments').filter((e) => e.courseId === courseId);
  },

  countForCourse(courseId) {
    return this.getByCourse(courseId).length;
  },

  isEnrolled(studentId, courseId) {
    return Boolean(this.getEnrollment(studentId, courseId));
  },

  markCompleted(enrollmentId) {
    return storageAdapter.updateInCollection('enrollments', enrollmentId, { status: 'completed', completedAt: new Date().toISOString() }).ok;
  },
};
