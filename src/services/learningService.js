// Lesson progress & course completion calculations.
// Formula: completed required lessons / total required lessons × 100.
import { storageAdapter } from '../storage/storageAdapter';
import { enrollmentService } from './enrollmentService';
import { uid } from '../utils/format';

export const learningService = {
  getCourseLessonIds(courseId) {
    const sectionIds = storageAdapter.getCollection('sections').filter((s) => s.courseId === courseId).map((s) => s.id);
    return storageAdapter.getCollection('lessons').filter((l) => sectionIds.includes(l.sectionId));
  },

  getProgress(studentId, courseId) {
    const lessons = this.getCourseLessonIds(courseId);
    const required = lessons.filter((l) => l.isRequired);
    const totalRequired = required.length;
    const progressRecords = storageAdapter.getCollection('lessonProgress').filter((p) => p.studentId === studentId && p.courseId === courseId && p.isCompleted);
    const completedIds = new Set(progressRecords.map((p) => p.lessonId));
    const completedRequired = required.filter((l) => completedIds.has(l.id)).length;
    const percentage = totalRequired === 0 ? 100 : Math.min(100, Math.max(0, Math.round((completedRequired / totalRequired) * 100)));
    return {
      totalRequired,
      completedRequired,
      totalLessons: lessons.length,
      completedLessons: lessons.filter((l) => completedIds.has(l.id)).length,
      percentage,
      completedLessonIds: [...completedIds],
    };
  },

  toggleLesson(studentId, courseId, lessonId, completed) {
    const enrollment = enrollmentService.getEnrollment(studentId, courseId);
    if (!enrollment) return { ok: false, error: 'not_enrolled' };
    const all = storageAdapter.getCollection('lessonProgress');
    const existing = all.find((p) => p.studentId === studentId && p.lessonId === lessonId);
    const now = new Date().toISOString();
    if (existing) {
      storageAdapter.updateInCollection('lessonProgress', existing.id, { isCompleted: completed, completedAt: completed ? now : null, updatedAt: now });
    } else if (completed) {
      storageAdapter.insertInCollection('lessonProgress', { id: uid('prg'), studentId, courseId, lessonId, isCompleted: true, completedAt: now, updatedAt: now });
    }
    const progress = this.getProgress(studentId, courseId);
    // Auto-mark enrollment completed when all required lessons are done (quiz check happens in certificateService)
    if (progress.percentage === 100 && enrollment.status !== 'completed') {
      // keep 'active' until required quizzes also pass — certificateService decides completion
    }
    return { ok: true, progress };
  },

  getWeeklyActivity(studentId) {
    const records = storageAdapter.getCollection('lessonProgress').filter((p) => p.studentId === studentId && p.isCompleted && p.completedAt);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({ day: key, label: d, count: records.filter((p) => new Date(p.completedAt).toDateString() === key).length });
    }
    return days;
  },

  getRecentlyActiveCourses(studentId, limit = 3) {
    const records = storageAdapter.getCollection('lessonProgress').filter((p) => p.studentId === studentId && p.completedAt);
    const lastByCourse = {};
    for (const r of records) {
      if (!lastByCourse[r.courseId] || new Date(r.completedAt) > new Date(lastByCourse[r.courseId])) lastByCourse[r.courseId] = r.completedAt;
    }
    const enrolled = enrollmentService.getByStudent(studentId);
    return enrolled
      .map((e) => ({ ...e, lastActivity: lastByCourse[e.courseId] || e.enrolledAt, progress: this.getProgress(studentId, e.courseId) }))
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, limit);
  },
};
