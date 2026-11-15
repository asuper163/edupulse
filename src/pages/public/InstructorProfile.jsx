import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Users, BookOpenCheck, UserRound } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { storageAdapter } from '../../storage/storageAdapter';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { reviewService } from '../../services/reviewService';
import { formatNumber, formatDate } from '../../utils/format';
import Avatar from '../../components/common/Avatar';
import CourseCard from '../../components/common/CourseCard';
import { EmptyState } from '../../components/common/Feedback';

export default function InstructorProfile() {
  const { instructorId } = useParams();
  const { t, locale } = useLanguage();

  const data = useMemo(() => {
    const instructor = userService.getById(instructorId);
    if (!instructor || instructor.role !== 'instructor') return null;
    const courses = courseService.getByInstructor(instructor.id).filter((c) => c.status === 'published');
    const enrollments = storageAdapter.getCollection('enrollments');
    const studentCount = new Set(enrollments.filter((e) => courses.some((c) => c.id === e.courseId)).map((e) => e.studentId)).size;
    const ratingVals = courses.flatMap((c) => { const { average, count } = reviewService.averageForCourse(c.id); return count ? [average] : []; });
    const avg = ratingVals.length ? ratingVals.reduce((s, v) => s + v, 0) / ratingVals.length : 0;
    return { instructor, courses, studentCount, avgRating: avg };
  }, [instructorId]);

  if (!data) {
    return <div className="max-w-3xl mx-auto px-4 py-20"><EmptyState dark={false} icon={UserRound} title={t('instructors.notFound')} action={<Link to="/instructors" className="text-sm font-bold text-emerald-700">{t('instructors.title')} →</Link>} /></div>;
  }
  const { instructor, courses, studentCount, avgRating } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6">
        <Avatar name={instructor.name} src={instructor.avatar} size={120} />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{instructor.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('instructors.memberSince')} {formatDate(instructor.createdAt, locale, { year: 'numeric', month: 'long' })}</p>
          <p className="text-sm text-slate-600 leading-7 mt-4 max-w-2xl">{instructor.bio}</p>
          <div className="flex flex-wrap gap-6 mt-5">
            <div><p className="text-2xl font-black text-slate-900 tnum">{courses.length}</p><p className="text-[11px] text-slate-500 font-semibold">{t('instructors.publishedCourses')}</p></div>
            <div><p className="text-2xl font-black text-slate-900 tnum">{formatNumber(studentCount, locale)}</p><p className="text-[11px] text-slate-500 font-semibold">{t('instructors.totalStudents')}</p></div>
            <div><p className="text-2xl font-black text-amber-600 tnum">{avgRating ? avgRating.toFixed(1) : '—'}</p><p className="text-[11px] text-slate-500 font-semibold">{t('instructors.avgRating')}</p></div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-900 mt-10 mb-4">{t('instructors.viewCourses')}</h2>
      {courses.length === 0 ? (
        <p className="text-sm text-slate-500">{t('instructors.noPublished')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}
