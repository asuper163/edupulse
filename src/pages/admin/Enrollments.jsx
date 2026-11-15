import { useMemo, useState } from 'react';
import { Search, ClipboardList, CheckCircle2, Clock3 } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { storageAdapter } from '../../storage/storageAdapter';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { learningService } from '../../services/learningService';
import { Input } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import { ProgressBar, EmptyState, StatusBadge } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { formatDate } from '../../utils/format';

export default function Enrollments() {
  const { t, lang, locale } = useLanguage();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const users = Object.fromEntries(storageAdapter.getCollection('users').map((u) => [u.id, u]));
    const courses = Object.fromEntries(courseService.getAll().map((c) => [c.id, c]));
    return storageAdapter.getCollection('enrollments')
      .map((e) => ({ ...e, student: users[e.studentId], course: courses[e.courseId], progress: learningService.getProgress(e.studentId, e.courseId).percentage }))
      .filter((e) => e.student && e.course)
      .filter((e) => !q || `${e.student.name} ${e.student.email} ${localized(e.course.title, lang)}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
  }, [query, lang]);

  return (
    <div>
      <PageHeader title={t('admin.enrollmentsTitle')} subtitle={t('admin.enrollmentsSubtitle')} />
      <div className="mb-5 max-w-md"><Input dark icon={Search} placeholder={t('admin.searchEnrollments')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>

      {rows.length === 0 ? <EmptyState icon={ClipboardList} title={t('common.noData')} /> : (
        <div className="rounded-2xl border border-[#1c2941] overflow-hidden">
          <table className="w-full text-xs table-auto">
              <thead className="bg-[#111a2e] text-slate-500"><tr><th className="text-start px-3 py-3 font-bold">{t('roles.student')}</th><th className="text-start px-3 py-3 font-bold hidden md:table-cell">{t('nav.courses')}</th><th className="text-start px-3 py-3 font-bold hidden sm:table-cell">{t('admin.enrolledOn')}</th><th className="text-start px-3 py-3 font-bold">{t('admin.progressCol')}</th><th className="text-start px-3 py-3 font-bold">{t('admin.completedCol')}</th></tr></thead>
              <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#182238] transition-colors">
                    <td className="px-3 py-2.5 min-w-0"><p className="font-bold text-slate-100 line-clamp-1">{row.student.name}</p><p className="text-[9px] text-slate-500 truncate" dir="ltr">{row.student.email}</p></td>
                    <td className="px-3 py-2.5 text-slate-300 max-w-48 truncate hidden md:table-cell">{localized(row.course.title, lang)}</td>
                    <td className="px-3 py-2.5 text-slate-500 hidden sm:table-cell tnum">{formatDate(row.enrolledAt, locale, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-3 py-2.5 w-28 sm:w-40"><div className="flex items-center gap-2"><ProgressBar value={row.progress} className="flex-1" /><span className="tnum text-slate-400 w-8 text-end text-[10px]">{row.progress}%</span></div></td>
                    <td className="px-3 py-2.5">{row.status === 'completed' ? <span className="inline-flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 size={13} aria-hidden="true" />{t('status.completed')}</span> : <span className="inline-flex items-center gap-1 text-sky-400"><Clock3 size={13} aria-hidden="true" />{t('status.inProgress')}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
