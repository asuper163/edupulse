import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { storageAdapter } from '../../storage/storageAdapter';
import { learningService } from '../../services/learningService';
import { quizService } from '../../services/quizService';
import { userService } from '../../services/userService';
import { Input, Select } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import { ProgressBar, EmptyState } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { formatDate } from '../../utils/format';

export default function Students() {
  const { t, lang, locale } = useLanguage();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [courseId, setCourseId] = useState('');

  const myCourses = useMemo(() => courseService.getByInstructor(user.id), [user.id]);

  const rows = useMemo(() => {
    const courseIds = myCourses.map((c) => c.id);
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => courseIds.includes(e.courseId) && (!courseId || e.courseId === courseId));
    const q = query.trim().toLowerCase();
    return enrollments.map((e) => {
      const student = userService.getById(e.studentId);
      const progress = learningService.getProgress(e.studentId, e.courseId);
      const quizzes = quizService.getByCourse(e.courseId);
      const quizAttempts = quizzes.flatMap((qz) => quizService.getAttempts(qz.id, e.studentId));
      const avgQuiz = quizAttempts.length ? Math.round(quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length) : null;
      return { ...e, student, progress, avgQuiz, course: myCourses.find((c) => c.id === e.courseId) };
    }).filter((r) => r.student && (!q || `${r.student.name} ${r.student.email}`.toLowerCase().includes(q)));
  }, [myCourses, courseId, query]);

  return (
    <div>
      <PageHeader title={t('instructor.studentsTitle')} subtitle={t('instructor.studentsSubtitle')} />
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="flex-1"><Input dark icon={Search} placeholder={t('instructor.searchStudents')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>
        <Select dark value={courseId} onChange={(e) => setCourseId(e.target.value)} aria-label={t('instructor.filterByCourse')} className="sm:w-72">
          <option value="">{t('instructor.allCourses')}</option>
          {myCourses.map((c) => <option key={c.id} value={c.id}>{localized(c.title, lang)}</option>)}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title={t('instructor.noStudents')} />
      ) : (
        <div className="rounded-2xl border border-[#1c2941] overflow-hidden">
          <table className="w-full text-xs table-auto">
              <thead className="bg-[#111a2e] text-slate-500">
                <tr>
                  <th className="text-start px-3 py-3 font-bold">{t('common.name')}</th>
                  <th className="text-start px-3 py-3 font-bold hidden md:table-cell">{t('nav.courses')}</th>
                  <th className="text-start px-3 py-3 font-bold hidden sm:table-cell">{t('instructor.enrollmentDate')}</th>
                  <th className="text-start px-3 py-3 font-bold">{t('instructor.progressCol')}</th>
                  <th className="text-start px-3 py-3 font-bold hidden lg:table-cell">{t('instructor.quizPerformance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#182238] transition-colors">
                    <td className="px-3 py-3 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.student.name} src={row.student.avatar} size={34} />
                        <div className="min-w-0"><p className="font-bold text-slate-100 line-clamp-1">{row.student.name}</p><p className="text-[10px] text-slate-500 truncate" dir="ltr">{row.student.email}</p></div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 max-w-40 truncate hidden md:table-cell">{localized(row.course?.title, lang)}</td>
                    <td className="px-3 py-3 text-slate-400 hidden sm:table-cell tnum">{formatDate(row.enrolledAt, locale, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-3 py-3 w-28 sm:w-36"><div className="flex items-center gap-2"><ProgressBar value={row.progress.percentage} className="flex-1" /><span className="tnum text-slate-400 w-8 text-end text-[10px]">{row.progress.percentage}%</span></div></td>
                    <td className="px-3 py-3 tnum text-slate-300 hidden lg:table-cell">{row.avgQuiz === null ? '—' : `${row.avgQuiz}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
