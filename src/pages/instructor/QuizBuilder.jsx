import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Pencil, Trash2, Check, ListChecks, GripVertical, ChevronUp, ChevronDown, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { courseService } from '../../services/courseService';
import { quizService } from '../../services/quizService';
import { Input, Textarea, Select, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { localized } from '../../utils/localized';

const emptyQuiz = { title: '', desc: '', passingScore: 60, maxAttempts: 0, isRequired: true };
const emptyQuestion = () => ({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: 0, correctBool: true, points: 10 });

export default function QuizBuilder() {
  const { courseId } = useParams();
  const { t, lang, isRTL } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);
  const [selectedId, setSelectedId] = useState(null);
  const [quizModal, setQuizModal] = useState(null); // null | {} | {id}
  const [quizForm, setQuizForm] = useState(emptyQuiz);
  const [questionModal, setQuestionModal] = useState(null); // null | {} | {id}
  const [qForm, setQForm] = useState(emptyQuestion());
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(null);
  const [confirmDeleteQuestion, setConfirmDeleteQuestion] = useState(null);

  const course = useMemo(() => courseService.getById(courseId), [courseId, tick]);
  const quizzes = useMemo(() => (course ? quizService.getByCourse(course.id) : []), [course]); // eslint-disable-line
  const selected = quizzes.find((q) => q.id === (selectedId ?? quizzes[0]?.id)) || null;
  const questions = useMemo(() => (selected ? quizService.getQuestions(selected.id) : []), [selected, tick]); // eslint-disable-line

  if (!course) return <div className="text-center py-20 text-slate-400">{t('errors.generic')}</div>;
  if (course.instructorId !== user.id && user.role !== 'admin') return <div className="text-center py-20 text-red-400 font-bold">{t('errors.generic')}</div>;

  // ── Quiz CRUD ────────────────────────────────────────────
  const openQuizModal = (quiz) => {
    setQuizForm(quiz ? { title: quiz.title?.ar || '', desc: quiz.description?.ar || '', passingScore: quiz.passingScore, maxAttempts: quiz.maxAttempts, isRequired: quiz.isRequired } : emptyQuiz);
    setQuizModal(quiz ? { id: quiz.id } : {});
  };
  const saveQuiz = () => {
    if (!quizForm.title.trim()) { toast.error(t('validation.required')); return; }
    const payload = { courseId: course.id, title: { ar: quizForm.title, en: quizForm.title }, description: { ar: quizForm.desc, en: quizForm.desc }, passingScore: Number(quizForm.passingScore), maxAttempts: Number(quizForm.maxAttempts), isRequired: quizForm.isRequired };
    if (quizModal?.id) quizService.update(quizModal.id, payload);
    else { const res = quizService.create(payload); if (res.quiz) setSelectedId(res.quiz.id); }
    setQuizModal(null);
    toast.success(t('instructor.quizSaved'));
    refresh();
  };
  const deleteQuiz = (id) => { quizService.remove(id); setConfirmDeleteQuiz(null); toast.success(t('instructor.quizDeleted')); refresh(); };

  // ── Question CRUD ────────────────────────────────────────
  const openQuestionModal = (question) => {
    if (question) {
      const isTF = question.type === 'truefalse';
      setQForm({
        question: question.question?.ar || '', type: question.type,
        options: isTF ? [t('instructor.trueLabel'), t('instructor.falseLabel')] : [...(question.options?.ar || ['', '', '', ''])],
        correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
        correctBool: question.type === 'truefalse' ? Boolean(question.correctAnswer) : true,
        points: question.points || 10,
      });
      setQuestionModal({ id: question.id });
    } else {
      setQForm(emptyQuestion());
      setQuestionModal({});
    }
  };
  const setOption = (idx, value) => {
    setQForm((f) => {
      const next = [...f.options];
      next[idx] = value;
      return { ...f, options: next };
    });
  };
  const addOption = () => setQForm((f) => ({ ...f, options: [...f.options, ''] }));
  const removeOption = (idx) => setQForm((f) => f.options.length <= 2 ? f : ({ ...f, options: f.options.filter((_, i) => i !== idx), correctAnswer: f.correctAnswer === idx ? 0 : f.correctAnswer > idx ? f.correctAnswer - 1 : f.correctAnswer }));

  const saveQuestion = () => {
    if (!qForm.question.trim()) { toast.error(t('validation.required')); return; }
    let correctAnswer, options;
    if (qForm.type === 'truefalse') {
      correctAnswer = qForm.correctBool;
      options = { ar: [t('instructor.trueLabel'), t('instructor.falseLabel')], en: [t('instructor.trueLabel'), t('instructor.falseLabel')] };
    } else {
      const clean = qForm.options.map((o) => o.trim()).filter(Boolean);
      if (clean.length < 2) { toast.error(t('instructor.minOptions')); return; }
      options = { ar: clean, en: clean };
      if (qForm.correctAnswer >= options.ar.length) { toast.error(t('validation.required')); return; }
      correctAnswer = Number(qForm.correctAnswer);
    }
    const payload = { question: { ar: qForm.question, en: qForm.question }, type: qForm.type, options, correctAnswer, points: Number(qForm.points) || 10 };
    if (questionModal?.id) quizService.updateQuestion(questionModal.id, payload);
    else quizService.addQuestion(selected.id, payload);
    setQuestionModal(null);
    toast.success(t('instructor.questionSaved'));
    refresh();
  };
  const moveQuestion = (id, dir) => {
    const ids = questions.map((q) => q.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    quizService.reorderQuestions(selected.id, ids);
    refresh();
  };

  const fieldInput = 'w-full h-10 rounded-xl border border-[#233047] bg-[#0B1120] text-slate-100 px-3 text-sm outline-none focus:border-[#10B981]';

  return (
    <div>
      <PageHeader
        title={t('instructor.quizBuilderTitle')}
        subtitle={t('instructor.quizBuilderSubtitle')}
        actions={<Link to="/instructor/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-100"><BackIcon size={14} aria-hidden="true" />{t('instructor.backToCourses')}</Link>}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Quiz list */}
        <section className="lg:col-span-2 rounded-2xl border border-[#1c2941] bg-[#111a2e] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 tnum">{t('student.myQuizzes')} ({quizzes.length})</h2>
            <Button size="sm" icon={Plus} onClick={() => openQuizModal(null)}>{t('instructor.createQuiz')}</Button>
          </div>
          {quizzes.length === 0 ? <p className="text-xs text-slate-500 py-8 text-center">{t('instructor.noQuizzes')}</p> : (
            <ul className="space-y-2">
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${selected?.id === quiz.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#1c2941] hover:border-[#2c3a55]'}`}>
                    <button onClick={() => setSelectedId(quiz.id)} className="flex-1 min-w-0 text-start">
                      <span className="block text-[11px] font-bold text-slate-100 truncate">{localized(quiz.title, lang)}</span>
                      <span className="block text-[9px] text-slate-500 tnum">{quiz.passingScore}% {t('quiz.passingScore')} · {quizService.getQuestions(quiz.id).length} {t('admin.questionsCount')}{quiz.isRequired ? ` · ${t('quiz.requiredBadge')}` : ''}</span>
                    </button>
                    <button className="p-1.5 text-slate-500 hover:text-slate-200" onClick={() => openQuizModal(quiz)} aria-label={t('common.edit')}><Pencil size={14} /></button>
                    <button className="p-1.5 text-slate-500 hover:text-red-400" onClick={() => setConfirmDeleteQuiz(quiz.id)} aria-label={t('common.delete')}><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Question manager */}
        <section className="lg:col-span-3 rounded-2xl border border-[#1c2941] bg-[#111a2e] p-4">
          {!selected ? (
            <p className="text-xs text-slate-500 py-12 text-center">{t('instructor.createQuiz')}</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 truncate">{localized(selected.title, lang)}</h2>
                <Button size="sm" icon={Plus} onClick={() => openQuestionModal(null)}>{t('instructor.addQuestion')}</Button>
              </div>
              {questions.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">{t('instructor.noQuestions')}</p>
              ) : (
                <ol className="space-y-2">
                  {questions.map((q, i) => (
                    <li key={q.id} className="flex items-start gap-2 rounded-xl border border-[#1c2941] bg-[#151F32] px-3 py-2.5">
                      <span className="w-6 h-6 shrink-0 rounded-md bg-[#1B2740] text-[10px] font-black text-slate-500 flex items-center justify-center tnum mt-0.5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-100 leading-snug">{localized(q.question, lang)}</p>
                        <p className="text-[9px] text-slate-500 mt-1">{q.type === 'truefalse' ? t('quiz.trueFalse') : t('quiz.multipleChoice')} · {t('instructor.correctAnswer')}: {q.type === 'truefalse' ? (q.correctAnswer ? t('instructor.trueLabel') : t('instructor.falseLabel')) : String.fromCharCode(65 + Number(q.correctAnswer))} · {q.points} {t('quiz.points')}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button className="p-1.5 text-slate-600 hover:text-slate-200" onClick={() => moveQuestion(q.id, -1)} aria-label={t('instructor.moveUp')}><ChevronUp size={13} /></button>
                        <button className="p-1.5 text-slate-600 hover:text-slate-200" onClick={() => moveQuestion(q.id, 1)} aria-label={t('instructor.moveDown')}><ChevronDown size={13} /></button>
                      </div>
                      <button className="p-1.5 text-slate-500 hover:text-slate-200 shrink-0" onClick={() => openQuestionModal(q)} aria-label={t('common.edit')}><Pencil size={14} /></button>
                      <button className="p-1.5 text-slate-500 hover:text-red-400 shrink-0" onClick={() => setConfirmDeleteQuestion(q.id)} aria-label={t('common.delete')}><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </section>
      </div>

      {/* Quiz modal */}
      <Modal open={!!quizModal} onClose={() => setQuizModal(null)} title={quizModal?.id ? t('instructor.editQuiz') : t('instructor.createQuiz')}>
        <div className="grid gap-3">
          <FormField dark label={t('instructor.quizTitleAr')} htmlFor="qzAr" required><Input dark id="qzAr" dir="rtl" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} /></FormField>
          <FormField dark label={t('instructor.quizDescAr')} htmlFor="qzdAr"><Textarea dark id="qzdAr" rows={2} dir="rtl" value={quizForm.desc} onChange={(e) => setQuizForm({ ...quizForm, desc: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField dark label={t('instructor.passingScore')} htmlFor="pass"><Input dark id="pass" type="number" min={1} max={100} dir="ltr" className="text-start" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })} /></FormField>
            <FormField dark label={t('instructor.maxAttempts')} htmlFor="maxAt"><Input dark id="maxAt" type="number" min={0} dir="ltr" className="text-start" value={quizForm.maxAttempts} onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: e.target.value })} /></FormField>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 select-none">
            <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={quizForm.isRequired} onChange={(e) => setQuizForm({ ...quizForm, isRequired: e.target.checked })} />
            {t('instructor.quizRequired')}
          </label>
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setQuizModal(null)}>{t('common.cancel')}</Button><Button icon={Check} onClick={saveQuiz}>{t('common.save')}</Button></div>
        </div>
      </Modal>

      {/* Question modal */}
      <Modal open={!!questionModal} onClose={() => setQuestionModal(null)} title={questionModal?.id ? t('instructor.editQuestion') : t('instructor.addQuestion')} size="lg">
        <div className="grid gap-3">
          <FormField dark label={t('instructor.questionAr')} htmlFor="qAr" required><Textarea dark id="qAr" rows={2} dir="rtl" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField dark label={t('instructor.questionType')} htmlFor="qType">
              <Select dark id="qType" value={qForm.type} onChange={(e) => setQForm({ ...qForm, type: e.target.value })}>
                <option value="mcq">{t('quiz.multipleChoice')}</option>
                <option value="truefalse">{t('quiz.trueFalse')}</option>
              </Select>
            </FormField>
            <FormField dark label={t('instructor.points')} htmlFor="points"><Input dark id="points" type="number" min={1} dir="ltr" className="text-start" value={qForm.points} onChange={(e) => setQForm({ ...qForm, points: e.target.value })} /></FormField>
          </div>

          {qForm.type === 'truefalse' ? (
            <fieldset>
              <legend className="text-xs font-bold text-slate-400 mb-2">{t('instructor.correctAnswer')}</legend>
              <div className="flex gap-2">
                {[{ v: true, label: t('instructor.trueLabel') }, { v: false, label: t('instructor.falseLabel') }].map(({ v, label }) => (
                  <label key={String(v)} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 cursor-pointer text-sm font-bold ${qForm.correctBool === v ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-[#233047] text-slate-400'}`}>
                    <input type="radio" className="sr-only" name="tf-correct" checked={qForm.correctBool === v} onChange={() => setQForm({ ...qForm, correctBool: v })} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset>
              <legend className="text-xs font-bold text-slate-400 mb-2">{t('instructor.correctAnswer')}</legend>
              <div className="grid gap-2">
                {qForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="mcq-correct" className="accent-emerald-500 w-4 h-4 shrink-0" aria-label={`${t('instructor.correctAnswer')} ${i + 1}`} checked={qForm.correctAnswer === i} onChange={() => setQForm({ ...qForm, correctAnswer: i })} />
                    <input dir="rtl" className={fieldInput} placeholder={`${t('instructor.optionAr')} ${i + 1}`} value={opt} onChange={(e) => setOption(i, e.target.value)} />
                    <button type="button" onClick={() => removeOption(i)} className="p-2 text-slate-600 hover:text-red-400 shrink-0" aria-label={t('common.remove')}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addOption} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"><Plus size={13} aria-hidden="true" />{t('instructor.addOption')}</button>
            </fieldset>
          )}
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setQuestionModal(null)}>{t('common.cancel')}</Button><Button icon={Check} onClick={saveQuestion}>{t('common.save')}</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmDeleteQuiz} onClose={() => setConfirmDeleteQuiz(null)} onConfirm={() => deleteQuiz(confirmDeleteQuiz)} title={t('common.delete')} message={t('instructor.confirmDeleteQuiz')} confirmLabel={t('common.delete')} danger />
      <ConfirmDialog open={!!confirmDeleteQuestion} onClose={() => setConfirmDeleteQuestion(null)} onConfirm={() => { quizService.deleteQuestion(confirmDeleteQuestion); setConfirmDeleteQuestion(null); toast.success(t('instructor.questionDeleted')); refresh(); }} title={t('common.delete')} message={t('instructor.confirmDeleteQuestion')} confirmLabel={t('common.delete')} danger />
    </div>
  );
}
