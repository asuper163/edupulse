// Certificate eligibility & issuance.
// Requirements: enrolled + all required lessons completed + all required quizzes passed.
import { storageAdapter } from '../storage/storageAdapter';
import { learningService } from './learningService';
import { quizService } from './quizService';
import { enrollmentService } from './enrollmentService';
import { notificationService } from './notificationService';

function uniqueCertificateNumber() {
  const year = new Date().getFullYear();
  const existing = new Set(storageAdapter.getCollection('certificates').map((c) => c.certificateNumber));
  for (let i = 0; i < 50; i++) {
    const num = `EP-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!existing.has(num)) return num;
  }
  return `EP-${year}-${Date.now().toString().slice(-6)}`;
}

export const certificateService = {
  checkEligibility(studentId, courseId) {
    const enrollment = enrollmentService.getEnrollment(studentId, courseId);
    if (!enrollment) return { eligible: false, reason: 'not_enrolled' };
    const progress = learningService.getProgress(studentId, courseId);
    if (progress.percentage < 100) return { eligible: false, reason: 'lessons_incomplete', progress };
    const requiredQuizzes = quizService.getByCourse(courseId).filter((q) => q.isRequired && q.status === 'published');
    const unpassed = requiredQuizzes.filter((q) => !quizService.hasPassed(q.id, studentId));
    if (unpassed.length) return { eligible: false, reason: 'quizzes_unpassed', quizzes: unpassed };
    return { eligible: true, progress };
  },

  // Issues a certificate if eligible; returns existing certificate otherwise. Idempotent.
  checkAndIssue(studentId, courseId) {
    const existing = storageAdapter.getCollection('certificates').find((c) => c.studentId === studentId && c.courseId === courseId);
    if (existing) return { ok: true, certificate: existing, created: false };
    const check = this.checkEligibility(studentId, courseId);
    if (!check.eligible) return { ok: false, reason: check.reason };
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    const enrollment = enrollmentService.getEnrollment(studentId, courseId);
    const certificate = {
      id: `crt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      certificateNumber: uniqueCertificateNumber(),
      studentId, courseId,
      instructorId: course?.instructorId || null,
      issuedAt: new Date().toISOString(),
    };
    storageAdapter.insertInCollection('certificates', certificate);
    // Mark enrollment completed now that all requirements are met
    if (enrollment && enrollment.status !== 'completed') {
      storageAdapter.updateInCollection('enrollments', enrollment.id, { status: 'completed', completedAt: new Date().toISOString() });
    }
    notificationService.create({
      userId: studentId,
      title: { ar: 'صدرت شهادتك!', en: 'Your certificate is ready!' },
      message: { ar: `أكملت دورة «${course?.title?.ar}» — شهادتك برقم ${certificate.certificateNumber}.`, en: `You completed “${course?.title?.en}” — certificate no. ${certificate.certificateNumber}.` },
      type: 'certificate',
    });
    return { ok: true, certificate, created: true };
  },

  getByStudent(studentId) {
    return storageAdapter.getCollection('certificates').filter((c) => c.studentId === studentId).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  },
  getAll() {
    return storageAdapter.getCollection('certificates').sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  },
  getById(id) {
    return storageAdapter.getCollection('certificates').find((c) => c.id === id) || null;
  },
  count() {
    return storageAdapter.getCollection('certificates').length;
  },
};
