import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Archive, Star, Layers, Clock, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { categoryService } from '../../services/categoryService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { StatusBadge, Badge, Tabs } from '../../components/common/Feedback';
import { Input, FormField, Textarea } from '../../components/common/FormControls';
import { localized, localizedList } from '../../utils/localized';
import { formatDate, formatWeeks } from '../../utils/format';

export default function CourseReview() {
  const { courseId } = useParams();
  const { t, lang, locale, isRTL } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const [tab, setTab] = useState('overview');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reasonAr, setReasonAr] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [tick, setTick] = useState(0);

  const course = useMemo(() => courseService.getById(courseId), [courseId, tick]); // eslint-disable-line
  const curriculum = useMemo(() => (course ? courseService.getCurriculum(course.id) : []), [course]); // eslint-disable-line

  if (!course) return <div className="text-center py-20 text-slate-400">{t('errors.generic')}</div>;
  const instructor = userService.getById(course.instructorId);
  const category = categoryService.getById(course.categoryId);

  const approve = () => { courseService.approve(course.id, { requesterRole: 'admin' }); toast.success(t('admin.courseApproved')); setTick((v) => v + 1); };
  const archive = () => { courseService.archive(course.id, { requesterId: user.id, requesterRole: 'admin' }); toast.success(t('admin.courseArchived')); setTick((v) => v + 1); };
  const submitReject = () => {
    if (!reasonAr.trim()) { setReasonError(t('admin.rejectReasonRequired')); return; }
    courseService.reject(course.id, { ar: reasonAr, en: reasonAr }, { requesterRole: 'admin' });
    setRejectOpen(false);
    toast.success(t('admin.courseRejected'));
    setTick((v) => v + 1);
  };

  return (
    <div className="max-w-5xl">
      <PageHeader title={t('admin.courseDetailsTitle')} actions={<button onClick={() => navigate('/admin/courses')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-100"><BackIcon size={14} aria-hidden="true" />{t('common.back')}</button>} />

      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {course.thumbnail && <img src={course.thumbnail} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full sm:w-52 h-36 object-cover rounded-xl shrink-0 bg-[#1B2740]" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge status={course.status} /><Badge color="amber">{t(`courses.levels.${course.difficulty}`)}</Badge>{category && <span className="text-[10px] text-slate-500 font-bold">{localized(category.name, lang)}</span>}</div>
            <h2 className="text-xl font-black text-slate-100 leading-snug mt-2">{localized(course.title, lang)}</h2>
            <p className="text-[11px] text-slate-500 mt-1">{t('admin.instructorLabel')}: <span className="text-slate-300 font-bold">{instructor?.name}</span> · {t('admin.submittedOn')}: {course.submittedAt ? formatDate(course.submittedAt, locale) : '—'}</p>
            <p className="flex flex-wrap gap-4 text-[10px] text-slate-500 mt-2 tnum"><span className="inline-flex items-center gap-1"><Layers size={12} aria-hidden="true" />{course.sectionCount} {t('admin.sectionsCount')} · {course.lessonCount} {t('admin.lessonsCount')}</span><span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" />{formatWeeks(course.estimatedDuration)} · {course.estimatedHours} ساعة · {course.projectCount} مشاريع</span><span className="inline-flex items-center gap-1"><Users size={12} aria-hidden="true" />{course.enrollmentCount}</span><span className="inline-flex items-center gap-1 text-amber-400"><Star size={12} fill="currentColor" aria-hidden="true" />{course.avgRating ? course.avgRating.toFixed(1) : '—'} ({course.reviewCount})</span></p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 mt-5 border-t border-[#1c2941] pt-5">
          {course.status === 'pending' && (
            <>
              <Button variant="primary" icon={CheckCircle2} onClick={approve}>{t('admin.approveCourse')}</Button>
              <Button variant="danger" icon={XCircle} onClick={() => setRejectOpen(true)}>{t('admin.rejectCourse')}</Button>
            </>
          )}
          {course.status !== 'archived' && <Button variant="secondary-dark" icon={Archive} onClick={archive}>{t('admin.archiveCourse')}</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5">
        <Tabs tabs={[{ key: 'overview', label: t('courseDetail.overview') }, { key: 'curriculum', label: t('courseDetail.curriculum'), count: course.lessonCount }, { key: 'objectives', label: t('instructor.formObjectives') }]} active={tab} onChange={setTab} />
      </div>

      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 sm:p-6 mt-3">
        {tab === 'overview' && (
          <div>
            <p className="text-sm text-slate-300 leading-8 whitespace-pre-line">{localized(course.description, lang)}</p>
            <p className="text-[11px] text-slate-500 mt-4">{localized(course.shortDescription, lang)}</p>
          </div>
        )}
        {tab === 'curriculum' && (
          <ol className="space-y-3">
            {curriculum.map((section, si) => (
              <li key={section.id} className="rounded-xl border border-[#1c2941] overflow-hidden">
                <p className="bg-[#111a2e] px-4 py-2 text-[11px] font-black text-slate-300">{si + 1}. {localized(section.title, lang)}</p>
                <ul className="divide-y divide-[#1c2941]">
                  {section.lessons.map((lesson) => <li key={lesson.id} className="flex items-center justify-between gap-3 px-4 py-2 text-[11px] text-slate-400"><span>{localized(lesson.title, lang)}</span><span className="tnum text-slate-600">{lesson.duration} {t('courseDetail.minutes')}</span></li>)}
                </ul>
              </li>
            ))}
          </ol>
        )}
        {tab === 'objectives' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div><h3 className="text-xs font-bold text-slate-400 mb-2">{t('courseDetail.objectives')}</h3><ul className="list-disc ps-5 text-xs text-slate-300 space-y-1">{localizedList(course.learningObjectives, lang).map((o, i) => <li key={i}>{o}</li>)}</ul></div>
            <div><h3 className="text-xs font-bold text-slate-400 mb-2">{t('courseDetail.prerequisites')}</h3><ul className="list-disc ps-5 text-xs text-slate-300 space-y-1">{localizedList(course.prerequisites, lang).map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          </div>
        )}
      </div>

      {/* Rejection modal — mandatory Arabic-only reason (single-language product) */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={t('admin.rejectionComposer', { title: localized(course.title, lang) })}>
        <p className="text-xs text-slate-400 mb-3">{t('admin.rejectReasonHint')}</p>
        {reasonError && <p role="alert" className="text-xs text-red-400 font-bold mb-2">{reasonError}</p>}
        <div className="grid gap-3">
          <FormField dark label={t('admin.rejectReasonAr')} htmlFor="rrAr" required><Textarea dark id="rrAr" rows={3} dir="rtl" value={reasonAr} onChange={(e) => { setReasonAr(e.target.value); setReasonError(''); }} /></FormField>
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setRejectOpen(false)}>{t('common.cancel')}</Button><Button variant="danger" icon={XCircle} onClick={submitReject}>{t('admin.rejectCourse')}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
