import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ArrowRight, Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown, Check, X, Send, ListVideo, Clock3 } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { courseService } from '../../services/courseService';
import { curriculumService } from '../../services/curriculumService';
import { Input, Textarea, Select, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { formatDuration } from '../../utils/format';

const emptySection = { title: '', desc: '' };
const emptyLesson = { title: '', desc: '', content: '', videoUrl: '', duration: 15, type: 'video', isRequired: true };

function SortableRow({ id, container, handleLabel, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { container } });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-2 rounded-xl border px-2 py-2 bg-[#151F32] ${isDragging ? 'border-emerald-500 shadow-2xl z-10' : 'border-[#1c2941]'}`}>
      <button {...attributes} {...listeners} aria-label={handleLabel} className="p-1.5 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing touch-none"><GripVertical size={16} aria-hidden="true" /></button>
      {children}
    </li>
  );
}

export default function CurriculumBuilder() {
  const { courseId } = useParams();
  const { t, lang, isRTL } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionModal, setSectionModal] = useState(null); // {id?} + values
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [lessonModal, setLessonModal] = useState(null);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [confirmDelete, setConfirmDelete] = useState(null); // {type, id}

  const course = useMemo(() => courseService.getById(courseId), [courseId, tick]);
  const curriculum = useMemo(() => (course ? courseService.getCurriculum(course.id) : []), [course]); // eslint-disable-line
  const activeSection = curriculum.find((s) => s.id === (selectedSection ?? curriculum[0]?.id)) || null;
  const totals = useMemo(() => {
    const lessons = curriculum.flatMap((s) => s.lessons);
    return { lessons: lessons.length, duration: lessons.reduce((sum, l) => sum + Number(l.duration || 0), 0) };
  }, [curriculum]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!course) return <div className="text-center py-20 text-slate-400">{t('errors.generic')}</div>;
  if (course.instructorId !== user.id && user.role !== 'admin') return <div className="text-center py-20 text-red-400 font-bold">{t('errors.generic')}</div>;

  const openSectionModal = (section) => {
    setSectionForm(section ? { title: section.title?.ar || '', desc: section.description?.ar || '' } : emptySection);
    setSectionModal(section ? { id: section.id } : {});
  };
  const saveSection = () => {
    if (!sectionForm.title.trim()) { toast.error(t('validation.required')); return; }
    const payload = { title: { ar: sectionForm.title, en: sectionForm.title }, description: { ar: sectionForm.desc, en: sectionForm.desc } };
    if (sectionModal?.id) curriculumService.updateSection(sectionModal.id, payload);
    else curriculumService.createSection(course.id, { ...payload });
    setSectionModal(null);
    toast.success(t('instructor.sectionSaved'));
    refresh();
  };

  const openLessonModal = (lesson) => {
    setLessonForm(lesson ? { title: lesson.title?.ar || '', desc: lesson.description?.ar || '', content: lesson.content?.ar || '', videoUrl: lesson.videoUrl || '', duration: lesson.duration || 15, type: lesson.type || 'video', isRequired: lesson.isRequired !== false } : emptyLesson);
    setLessonModal(lesson ? { id: lesson.id } : {});
  };
  const saveLesson = () => {
    if (!lessonForm.title.trim()) { toast.error(t('validation.required')); return; }
    if (!activeSection) return;
    const payload = { title: { ar: lessonForm.title, en: lessonForm.title }, description: { ar: lessonForm.desc, en: lessonForm.desc }, content: { ar: lessonForm.content, en: lessonForm.content }, videoUrl: lessonForm.videoUrl.trim(), duration: lessonForm.duration, type: lessonForm.type, isRequired: lessonForm.isRequired };
    if (lessonModal?.id) curriculumService.updateLesson(lessonModal.id, payload);
    else curriculumService.createLesson(activeSection.id, course.id, payload);
    setLessonModal(null);
    toast.success(t('instructor.lessonSaved'));
    refresh();
  };

  const submitForReview = () => {
    const res = courseService.submitForApproval(course.id, { requesterId: user.id, requesterRole: user.role });
    if (res.ok) { toast.success(t('instructor.courseSubmitted')); navigate('/instructor/courses'); } else toast.error(t('errors.generic'));
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (active.data.current?.container === 'sections') {
      const ids = curriculum.map((s) => s.id);
      const from = ids.indexOf(active.id);
      const to = ids.indexOf(over.id);
      if (from < 0 || to < 0) return;
      curriculumService.reorderSections(course.id, arrayMove(ids, from, to));
    } else if (active.data.current?.container === 'lessons' && activeSection) {
      const ids = activeSection.lessons.map((l) => l.id);
      const from = ids.indexOf(active.id);
      const to = ids.indexOf(over.id);
      if (from < 0 || to < 0) return;
      curriculumService.reorderLessons(activeSection.id, arrayMove(ids, from, to));
    }
    refresh();
  };

  const moveItem = (container, id, dir) => {
    if (container === 'sections') {
      const ids = curriculum.map((s) => s.id);
      const i = ids.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= ids.length) return;
      curriculumService.reorderSections(course.id, arrayMove(ids, i, j));
    } else if (activeSection) {
      const ids = activeSection.lessons.map((l) => l.id);
      const i = ids.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= ids.length) return;
      curriculumService.reorderLessons(activeSection.id, arrayMove(ids, i, j));
    }
    refresh();
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'section') { curriculumService.deleteSection(confirmDelete.id); toast.success(t('instructor.sectionDeleted')); if (selectedSection === confirmDelete.id) setSelectedSection(null); }
    else { curriculumService.deleteLesson(confirmDelete.id); toast.success(t('instructor.lessonDeleted')); }
    setConfirmDelete(null);
    refresh();
  };

  const iconBtn = 'p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1B2740] transition-colors';

  return (
    <div>
      <PageHeader
        title={t('instructor.curriculumTitle')}
        subtitle={t('instructor.curriculumSubtitle')}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/instructor/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-100"><BackIcon size={14} aria-hidden="true" />{t('instructor.backToCourses')}</Link>
            {['draft', 'rejected'].includes(course.status) && <Button size="sm" variant="secondary-dark" icon={Send} onClick={submitForReview}>{t('instructor.submitForReview')}</Button>}
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-3 mb-4 text-[10px] text-slate-500">
        <StatusBadge status={course.status} />
        <span className="inline-flex items-center gap-1 tnum"><ListVideo size={12} aria-hidden="true" />{totals.lessons} {t('courseDetail.lessons')}</span>
        <span className="inline-flex items-center gap-1 tnum"><Clock3 size={12} aria-hidden="true" />{formatDuration(totals.duration, lang)}</span>
        <span className="text-slate-600">{t('instructor.dragHint')}</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Sections column */}
          <section aria-label={t('instructor.manageCurriculum')} className="lg:col-span-2 rounded-2xl border border-[#1c2941] bg-[#111a2e] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('courseDetail.sections')} ({curriculum.length})</h2>
              <Button size="sm" icon={Plus} onClick={() => openSectionModal(null)}>{t('instructor.addSection')}</Button>
            </div>
            {curriculum.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">{t('instructor.noSections')}</p>
            ) : (
              <SortableContext items={curriculum.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {curriculum.map((section) => (
                    <SortableRow key={section.id} id={section.id} container="sections" handleLabel={t('instructor.moveUp')}>
                      <button onClick={() => setSelectedSection(section.id)} aria-current={(activeSection?.id) === section.id} className={`flex-1 min-w-0 text-start px-2 py-1.5 rounded-lg transition-colors ${(activeSection?.id) === section.id ? 'bg-emerald-500/10' : ''}`}>
                        <span className="block text-[11px] font-bold text-slate-100 truncate">{localized(section.title, lang)}</span>
                        <span className="block text-[9px] text-slate-500 tnum">{section.lessons.length} {t('courseDetail.lessons')}</span>
                      </button>
                      <button className={iconBtn} onClick={() => moveItem('sections', section.id, -1)} aria-label={t('instructor.moveUp')}><ChevronUp size={14} /></button>
                      <button className={iconBtn} onClick={() => moveItem('sections', section.id, 1)} aria-label={t('instructor.moveDown')}><ChevronDown size={14} /></button>
                      <button className={iconBtn} onClick={() => openSectionModal(section)} aria-label={t('instructor.editSection')}><Pencil size={14} /></button>
                      <button className={`${iconBtn} hover:text-red-400`} onClick={() => setConfirmDelete({ type: 'section', id: section.id })} aria-label={t('instructor.deleteSection')}><Trash2 size={14} /></button>
                    </SortableRow>
                  ))}
                </ul>
              </SortableContext>
            )}
          </section>

          {/* Lessons column */}
          <section aria-label={t('courseDetail.lessons')} className="lg:col-span-3 rounded-2xl border border-[#1c2941] bg-[#111a2e] p-4">
            {!activeSection ? (
              <p className="text-xs text-slate-500 py-12 text-center">{t('instructor.selectSection')}</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 truncate">{localized(activeSection.title, lang)} ({activeSection.lessons.length})</h2>
                  <Button size="sm" icon={Plus} onClick={() => openLessonModal(null)}>{t('instructor.addLesson')}</Button>
                </div>
                {activeSection.lessons.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">{t('instructor.noLessons')}</p>
                ) : (
                  <SortableContext items={activeSection.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {activeSection.lessons.map((lesson, li) => (
                        <SortableRow key={lesson.id} id={lesson.id} container="lessons" handleLabel={t('instructor.moveUp')}>
                          <span className="w-6 h-6 shrink-0 rounded-md bg-[#1B2740] text-[10px] font-black text-slate-500 flex items-center justify-center tnum">{li + 1}</span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[11px] font-bold text-slate-100 truncate">{localized(lesson.title, lang)}</span>
                            <span className="block text-[9px] text-slate-500 tnum">{lesson.type} · {lesson.duration} {t('courseDetail.minutes')}{lesson.isRequired ? '' : ` · ${t('common.optional')}`}</span>
                          </span>
                          <button className={iconBtn} onClick={() => moveItem('lessons', lesson.id, -1)} aria-label={t('instructor.moveUp')}><ChevronUp size={14} /></button>
                          <button className={iconBtn} onClick={() => moveItem('lessons', lesson.id, 1)} aria-label={t('instructor.moveDown')}><ChevronDown size={14} /></button>
                          <button className={iconBtn} onClick={() => openLessonModal(lesson)} aria-label={t('instructor.editLesson')}><Pencil size={14} /></button>
                          <button className={`${iconBtn} hover:text-red-400`} onClick={() => setConfirmDelete({ type: 'lesson', id: lesson.id })} aria-label={t('instructor.deleteLesson')}><Trash2 size={14} /></button>
                        </SortableRow>
                      ))}
                    </ul>
                  </SortableContext>
                )}
              </>
            )}
          </section>
        </div>
      </DndContext>

      {/* Section modal */}
      <Modal open={!!sectionModal} onClose={() => setSectionModal(null)} title={sectionModal?.id ? t('instructor.editSection') : t('instructor.addSection')}>
        <div className="grid gap-3">
          <FormField dark label={t('instructor.sectionTitleAr')} htmlFor="secAr" required><Input dark id="secAr" dir="rtl" value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} /></FormField>
          <FormField dark label={t('instructor.sectionDescAr')} htmlFor="secDescAr"><Textarea dark id="secDescAr" rows={2} dir="rtl" value={sectionForm.desc} onChange={(e) => setSectionForm({ ...sectionForm, desc: e.target.value })} /></FormField>
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setSectionModal(null)}>{t('common.cancel')}</Button><Button icon={Check} onClick={saveSection}>{t('common.save')}</Button></div>
        </div>
      </Modal>

      {/* Lesson modal */}
      <Modal open={!!lessonModal} onClose={() => setLessonModal(null)} title={lessonModal?.id ? t('instructor.editLesson') : t('instructor.addLesson')} size="lg">
        <div className="grid gap-3">
          <FormField dark label={t('instructor.lessonTitleAr')} htmlFor="lesAr" required><Input dark id="lesAr" dir="rtl" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></FormField>
          <FormField dark label={t('instructor.lessonDescAr')} htmlFor="lesDescAr"><Textarea dark id="lesDescAr" rows={2} dir="rtl" value={lessonForm.desc} onChange={(e) => setLessonForm({ ...lessonForm, desc: e.target.value })} /></FormField>
          <FormField dark label={t('instructor.lessonContentAr')} htmlFor="lesContAr"><Textarea dark id="lesContAr" rows={3} dir="rtl" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} /></FormField>
          <div className="grid sm:grid-cols-4 gap-3">
            <FormField dark label={t('instructor.lessonType')} htmlFor="lesType" className="sm:col-span-1">
              <Select dark id="lesType" value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}>
                <option value="video">{t('instructor.typeVideo')}</option>
                <option value="text">{t('instructor.typeText')}</option>
                <option value="external">{t('instructor.typeExternal')}</option>
              </Select>
            </FormField>
            <FormField dark label={t('instructor.lessonDuration')} htmlFor="lesDur" className="sm:col-span-1"><Input dark id="lesDur" type="number" min={1} dir="ltr" className="text-start" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} /></FormField>
            <div className="sm:col-span-2 flex items-end">
              <label className="flex items-center gap-2 text-xs text-slate-300 select-none h-10">
                <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={lessonForm.isRequired} onChange={(e) => setLessonForm({ ...lessonForm, isRequired: e.target.checked })} />
                {t('instructor.lessonRequired')}
              </label>
            </div>
          </div>
          <FormField dark label={t('instructor.lessonVideo')} htmlFor="lesVid"><Input dark id="lesVid" type="url" dir="ltr" className="text-start" placeholder="https://www.youtube.com/embed/…" value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} /></FormField>
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setLessonModal(null)}>{t('common.cancel')}</Button><Button icon={Check} onClick={saveLesson}>{t('common.save')}</Button></div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={confirmDeleteAction} title={confirmDelete?.type === 'section' ? t('instructor.deleteSection') : t('instructor.deleteLesson')} message={confirmDelete?.type === 'section' ? t('instructor.confirmDeleteSection') : t('instructor.confirmDeleteLesson')} confirmLabel={t('common.delete')} danger />
    </div>
  );
}
