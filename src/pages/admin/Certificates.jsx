import { useMemo, useState } from 'react';
import { Search, Award, Printer } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { certificateService } from '../../services/certificateService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { Input } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { formatDate } from '../../utils/format';

export default function AdminCertificates() {
  const { t, lang, locale } = useLanguage();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const courses = Object.fromEntries(courseService.getAll().map((c) => [c.id, c]));
    return certificateService.getAll()
      .map((c) => ({ ...c, course: courses[c.courseId], student: userService.getById(c.studentId) }))
      .filter((c) => !q || `${c.certificateNumber} ${c.student?.name || ''}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <PageHeader title={t('admin.certificatesTitle')} subtitle={t('admin.certificatesSubtitle')} />
      <div className="mb-5 max-w-md"><Input dark icon={Search} placeholder={t('admin.searchCertificates')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>

      {rows.length === 0 ? <EmptyState icon={Award} title={t('common.noData')} /> : (
        <div className="rounded-2xl border border-[#1c2941] overflow-hidden">
          <table className="w-full text-xs table-auto">
              <thead className="bg-[#111a2e] text-slate-500"><tr><th className="text-start px-3 py-3 font-bold">{t('admin.certNumber')}</th><th className="text-start px-3 py-3 font-bold">{t('roles.student')}</th><th className="text-start px-3 py-3 font-bold hidden sm:table-cell">{t('nav.courses')}</th><th className="text-start px-3 py-3 font-bold hidden md:table-cell">{t('admin.issuedAt')}</th></tr></thead>
              <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-[#182238] transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-amber-400" dir="ltr">{c.certificateNumber}</td>
                    <td className="px-3 py-2.5 text-slate-200"><span className="block max-w-28 line-clamp-1">{c.student?.name}</span></td>
                    <td className="px-3 py-2.5 text-slate-400 max-w-40 truncate hidden sm:table-cell">{localized(c.course?.title, lang)}</td>
                    <td className="px-3 py-2.5 text-slate-500 hidden md:table-cell tnum">{formatDate(c.issuedAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
