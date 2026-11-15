// Reports + CSV export (UTF-8 BOM for Excel Arabic support).
import { storageAdapter } from '../storage/storageAdapter';
import { learningService } from './learningService';
import { reviewService } from './reviewService';

function rowsToCsv(rows) {
  if (!rows.length) return '';
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const headers = Object.keys(rows[0]);
  return [headers.map(esc).join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\r\n');
}

export const reportService = {
  build(type) {
    const users = storageAdapter.getCollection('users');
    const courses = storageAdapter.getCollection('courses');
    const enrollments = storageAdapter.getCollection('enrollments');
    const quizzes = storageAdapter.getCollection('quizzes');
    const attempts = storageAdapter.getCollection('quizAttempts');
    const categories = storageAdapter.getCollection('categories');
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
    const coursesById = Object.fromEntries(courses.map((c) => [c.id, c]));
    const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

    switch (type) {
      case 'users':
        return users.map((u) => ({ name: u.name, email: u.email, role: u.role, status: u.status, createdAt: u.createdAt?.slice(0, 10) }));
      case 'courses':
        return courses.map((c) => {
          const enr = enrollments.filter((e) => e.courseId === c.id).length;
          const { average, count } = reviewService.averageForCourse(c.id);
          return { title_en: c.title?.en, title_ar: c.title?.ar, instructor: usersById[c.instructorId]?.name || '', category: catById[c.categoryId]?.name?.en || '', status: c.status, difficulty: c.difficulty, enrollments: enr, avgRating: average.toFixed(1), reviews: count };
        });
      case 'enrollments':
        return enrollments.map((e) => ({ student: usersById[e.studentId]?.name || e.studentId, course_en: coursesById[e.courseId]?.title?.en, course_ar: coursesById[e.courseId]?.title?.ar, enrolledAt: e.enrolledAt?.slice(0, 10), progress: learningService.getProgress(e.studentId, e.courseId).percentage + '%', status: e.status }));
      case 'completions':
        return enrollments.filter((e) => e.status === 'completed').map((e) => ({ student: usersById[e.studentId]?.name || e.studentId, course_en: coursesById[e.courseId]?.title?.en, completedAt: e.completedAt?.slice(0, 10) || '' }));
      case 'quizzes':
        return quizzes.map((q) => {
          const qAttempts = attempts.filter((a) => a.quizId === q.id);
          const avg = qAttempts.length ? Math.round(qAttempts.reduce((s, a) => s + a.percentage, 0) / qAttempts.length) : 0;
          const passRate = qAttempts.length ? Math.round((qAttempts.filter((a) => a.passed).length / qAttempts.length) * 100) : 0;
          return { quiz_en: q.title?.en, course_en: coursesById[q.courseId]?.title?.en, attempts: qAttempts.length, avgScore: avg + '%', passRate: passRate + '%', passingScore: q.passingScore + '%' };
        });
      case 'instructors': {
        return users.filter((u) => u.role === 'instructor').map((u) => {
          const own = courses.filter((c) => c.instructorId === u.id);
          const enrCount = enrollments.filter((e) => own.some((c) => c.id === e.courseId)).length;
          const ratingVals = own.flatMap((c) => [reviewService.averageForCourse(c.id).average]).filter((v) => v > 0);
          const avgRating = ratingVals.length ? (ratingVals.reduce((s, v) => s + v, 0) / ratingVals.length).toFixed(1) : '—';
          return { name: u.name, email: u.email, courses: own.length, published: own.filter((c) => c.status === 'published').length, enrollments: enrCount, avgRating };
        });
      }
      case 'reviews':
        return storageAdapter.getCollection('reviews').map((r) => ({ course_en: coursesById[r.courseId]?.title?.en, student: usersById[r.studentId]?.name || r.studentId, rating: r.rating, status: r.status, comment: r.comment, createdAt: r.createdAt?.slice(0, 10) }));
      case 'sales':
        return storageAdapter.getCollection('subscriptionRequests').map((r) => {
          const paid = Number(r.amountPaid) || 0;
          const due = Number(r.amountDue) || 0;
          return { student: r.fullName, phone: r.phone, email: r.email, course_ar: coursesById[r.courseId]?.title?.ar || '', course_en: coursesById[r.courseId]?.title?.en || '', stage: r.stage, amount_due: due, amount_paid: paid, outstanding: Math.max(0, due - paid), method: r.method, createdAt: r.createdAt?.slice(0, 10) };
        });
      case 'payments': {
        const rows = [];
        for (const r of storageAdapter.getCollection('subscriptionRequests')) {
          if (Array.isArray(r.payments) && r.payments.length) {
            for (const p of r.payments) {
              rows.push({ student: r.fullName, phone: r.phone, course_ar: coursesById[r.courseId]?.title?.ar || '', amount: Number(p.amount) || 0, method: p.method, recorded_by: usersById[p.by]?.name || p.by || '', date: p.at?.slice(0, 10) });
            }
          } else if ((Number(r.amountPaid) || 0) > 0) {
            // Legacy / grandfathered requests may have amountPaid without a
            // payments array — surface them as a single settlement row.
            rows.push({ student: r.fullName, phone: r.phone, course_ar: coursesById[r.courseId]?.title?.ar || '', amount: Number(r.amountPaid) || 0, method: r.method || 'cash', recorded_by: 'تسوية (بيانات قديمة)', date: (r.decidedAt || r.createdAt || '').slice(0, 10) });
          }
        }
        return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      default:
        return [];
    }
  },

  downloadCsv(type) {
    const rows = this.build(type);
    if (!rows.length) return false;
    const csv = '\uFEFF' + rowsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupulse-${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },
};
