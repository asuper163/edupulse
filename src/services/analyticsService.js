// Aggregated analytics for dashboards — always computed from real local data.
import { storageAdapter } from '../storage/storageAdapter';
import { reviewService } from './reviewService';

export const analyticsService = {
  adminKpis() {
    const users = storageAdapter.getCollection('users');
    const courses = storageAdapter.getCollection('courses');
    const enrollments = storageAdapter.getCollection('enrollments');
    const certificates = storageAdapter.getCollection('certificates');
    const allVisible = storageAdapter.getCollection('reviews').filter((r) => r.status === 'visible');
    const avgRating = allVisible.length ? allVisible.reduce((s, r) => s + r.rating, 0) / allVisible.length : 0;
    return {
      totalUsers: users.length,
      students: users.filter((u) => u.role === 'student').length,
      instructors: users.filter((u) => u.role === 'instructor').length,
      totalCourses: courses.length,
      published: courses.filter((c) => c.status === 'published').length,
      pending: courses.filter((c) => c.status === 'pending').length,
      enrollments: enrollments.length,
      certificates: certificates.length,
      avgRating,
    };
  },

  enrollmentTrend(months = 6) {
    const enrollments = storageAdapter.getCollection('enrollments');
    const buckets = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(), m = d.getMonth();
      buckets.push({ month: d.toLocaleString('ar-EG', { month: 'short' }), y, m, count: enrollments.filter((e) => { const ed = new Date(e.enrolledAt); return ed.getFullYear() === y && ed.getMonth() === m; }).length });
    }
    return buckets;
  },

  userGrowth(months = 6) {
    const users = storageAdapter.getCollection('users');
    const buckets = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(), m = d.getMonth();
      buckets.push({ month: d.toLocaleString('ar-EG', { month: 'short' }), y, m, count: users.filter((u) => { const ud = new Date(u.createdAt); return ud.getFullYear() === y && ud.getMonth() === m; }).length });
    }
    return buckets;
  },

  courseDistribution() {
    const courses = storageAdapter.getCollection('courses').filter((c) => c.status === 'published');
    const categories = storageAdapter.getCollection('categories');
    return categories.map((c) => ({ name: c.name?.en || '', nameAr: c.name?.ar || '', value: courses.filter((x) => x.categoryId === c.id).length })).filter((x) => x.value > 0);
  },

  instructorKpis(instructorId) {
    const courses = storageAdapter.getCollection('courses').filter((c) => c.instructorId === instructorId);
    const courseIds = courses.map((c) => c.id);
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => courseIds.includes(e.courseId));
    const students = new Set(enrollments.map((e) => e.studentId));
    const ratings = courses.flatMap((c) => { const { average, count } = reviewService.averageForCourse(c.id); return count ? [average] : []; });
    return {
      totalCourses: courses.length,
      published: courses.filter((c) => c.status === 'published').length,
      pending: courses.filter((c) => c.status === 'pending').length,
      rejected: courses.filter((c) => c.status === 'rejected').length,
      totalStudents: students.size,
      totalEnrollments: enrollments.length,
      avgRating: ratings.length ? ratings.reduce((s, v) => s + v, 0) / ratings.length : 0,
    };
  },

  instructorEnrollmentsTrend(instructorId, months = 6) {
    const courseIds = storageAdapter.getCollection('courses').filter((c) => c.instructorId === instructorId).map((c) => c.id);
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => courseIds.includes(e.courseId));
    const buckets = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(), m = d.getMonth();
      buckets.push({ month: d.toLocaleString('ar-EG', { month: 'short' }), count: enrollments.filter((e) => { const ed = new Date(e.enrolledAt); return ed.getFullYear() === y && ed.getMonth() === m; }).length });
    }
    return buckets;
  },

  studentCounts() {
    const enrollments = storageAdapter.getCollection('enrollments');
    return { enrollments, students: new Set(enrollments.map((e) => e.studentId)).size };
  },
};
