import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, CheckCircle2, XCircle, Archive, RotateCcw, Eye } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { userService } from '../../services/userService';
import { Input, Select } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import { StatusBadge, EmptyState } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';

export default function AdminCourses() {
  const { t, lang, locale } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('pending');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const instructors = useMemo(() => userService.getAll({ role: 'instructor' }), []);
  const categories = useMemo(() => categoryService.getAll(), []);

  const courses = useMemo(() => {
    let list = courseService.getAll();
    if (status !== 'all') list = list.filter((c) => c.status === status);
    if (instructorId) list = list.filter((c) => c.instructorId === instructorId);
    if (categoryId) list = list.filter((c) => c.categoryId === categoryId);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((c) => [c.title?.ar, c.title?.en].filter(Boolean).join(' ').toLowerCase().includes(q));
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [status, instructorId, categoryId, query, tick]);

  const num = (n) => new Intl.NumberFormat(locale).format(n || 0);
  const approve = (id) => { courseService.approve(id, { requesterRole: 'admin' }); toast.success(t('admin.courseApproved')); refresh(); };
  const archive = (course) => { courseService.archive(course.id, { requesterId: user.id, requesterRole: 'admin' }); toast.success(t('admin.courseArchived')); refresh(); };
  const restore = (course) => { courseService.restore(course.id, { requesterRole: 'admin' }); toast.success(t('admin.courseRestored')); refresh(); };

  return (
    <div>
      <PageHeader title={t('admin.coursesTitle')} subtitle={t('admin.coursesSubtitle')} />
      <div className="flex flex-col lg:flex-row gap-2 mb-5">
        <div className="flex-1"><Input dark icon={Search} placeholder={t('admin.searchCourses')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>
        <Select dark value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('admin.filterStatusCourses')} className="lg:w-44">
          <option value="pending">{t('status.pending')}</option>
          <option value="all">{t('admin.allStatuses')}</option>
          <option value="published">{t('status.published')}</option>
          <option value="rejected">{t('status.rejected')}</option>
          <option value="draft">{t('status.draft')}</option>
          <option value="archived">{t('status.archived')}</option>
        </Select>
        <Select dark value={instructorId} onChange={(e) => setInstructorId(e.target.value)} aria-label={t('admin.filterInstructor')} className="lg:w-44">
          <option value="">{t('admin.allInstructors')}</option>
          {instructors.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
        <Select dark value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label={t('admin.filterCategory')} className="lg:w-48">
          <option value="">{t('admin.allCategories')}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name?.[lang]}</option>)}
        </Select>
      </div>

      {courses.length === 0 ? <EmptyState icon={BookOpen} title={t('common.noData')} /> : (
        <div className="rounded-2xl border border-[#1c2941] overflow-hidden">
          <table className="w-full text-xs table-auto">
              <thead className="bg-[#111a2e] text-slate-500"><tr><th className="text-start px-3 py-3 font-bold">{t('nav.courses')}</th><th className="text-start px-3 py-3 font-bold hidden md:table-cell">{t('courses.instructor')}</th><th className="text-start px-3 py-3 font-bold hidden lg:table-cell">{t('admin.filterCategory')}</th><th className="text-start px-3 py-3 font-bold">{t('admin.statusLabel')}</th><th className="text-start px-3 py-3 font-bold hidden sm:table-cell">{t('instructor.enrollmentsCol')}</th><th className="text-end px-3 py-3 font-bold">{t('common.actions')}</th></tr></thead>
              <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#182238] transition-colors">
                    <td className="px-3 py-2.5"><button onClick={() => navigate(`/admin/courses/${course.id}`)} className="font-bold text-slate-100 hover:text-emerald-400 transition-colors text-start line-clamp-2">{localized(course.title, lang)}</button></td>
                    <td className="px-3 py-2.5 text-slate-400 hidden md:table-cell"><span className="block max-w-28 truncate">{userService.getById(course.instructorId)?.name}</span></td>
                    <td className="px-3 py-2.5 text-slate-400 hidden lg:table-cell"><span className="block max-w-32 truncate">{localized(categories.find((c) => c.id === course.categoryId)?.name, lang)}</span></td>
                    <td className="px-3 py-2.5"><StatusBadge status={course.status} /></td>
                    <td className="px-3 py-2.5 text-slate-400 tnum hidden sm:table-cell">{num(course.enrollmentCount)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-[#1B2740]" onClick={() => navigate(`/admin/courses/${course.id}`)} aria-label={t('common.view')}><Eye size={15} /></button>
                        {course.status === 'pending' && <button className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10" onClick={() => approve(course.id)} aria-label={t('admin.approveCourse')}><CheckCircle2 size={15} /></button>}
                        {course.status === 'pending' && <button className="p-2 rounded-lg text-red-400 hover:bg-red-500/10" onClick={() => navigate(`/admin/courses/${course.id}`)} aria-label={t('admin.rejectCourse')}><XCircle size={15} /></button>}
                        {course.status !== 'archived' ? <button className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => archive(course)} aria-label={t('admin.archiveCourse')}><Archive size={15} /></button> : <button className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => restore(course)} aria-label={t('admin.restoreCourse')}><RotateCcw size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
