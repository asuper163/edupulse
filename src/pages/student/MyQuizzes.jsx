import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ClipboardList, PlayCircle, History, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentService } from '../../services/enrollmentService';
import { quizService } from '../../services/quizService';
import { courseService } from '../../services/courseService';
import { Tabs, EmptyState, Badge } from '../../components/common/Feedback';
import PageHeader from '../../components/common/PageHeader';
import { formatDate, formatNumber } from '../../utils/format';
import { localized } from '../../utils/localized';

export default function MyQuizzes() {
  const { t, lang, locale } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState('available');
  const [historyFor, setHistoryFor] = useState(null);

  const data = useMemo(() => {
    const enrolledCourseIds = enrollmentService.getByStudent(user.id).map((e) => e.courseId);
    const quizzes = quizService.getAll().filter((q) => enrolledCourseIds.includes(q.courseId));
    return quizzes.map((q) => {
      const attempts = quizService.getAttempts(q.id, user.id);
      const passed = attempts.some((a) => a.passed);
      const best = attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : null;
      const gate = quizService.canAttempt(q.id, user.id);
      const course = courseService.getById(q.courseId);
      return { quiz: q, attempts, passed, best, canAttempt: gate.ok, course };
    });
  }, [user.id]);

  const filtered = data.filter(({ attempts, passed, canAttempt }) => {
    switch (tab) {
      case 'available': return attempts.length === 0 || (canAttempt && !passed);
      case 'completed': return attempts.length > 0;
      case 'passed': return passed;
      case 'failed': return attempts.length > 0 && !passed;
      default: return true;
    }
  });

  const tabs = [
    { key: 'available', label: t('student.tabAvailable'), count: data.filter((d) => d.attempts.length === 0 || (d.canAttempt && !d.passed)).length },
    { key: 'completed', label: t('student.tabCompleted'), count: data.filter((d) => d.attempts.length > 0).length },
    { key: 'passed', label: t('student.tabPassed'), count: data.filter((d) => d.passed).length },
    { key: 'failed', label: t('student.tabFailed'), count: data.filter((d) => d.attempts.length > 0 && !d.passed).length },
    { key: 'all', label: t('student.tabAll'), count: data.length },
  ];

  return (
    <div>
      <PageHeader title={t('student.quizzesTitle')} subtitle={t('student.quizzesSubtitle')} />
      <div className="mb-5"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title={t('common.noData')} hint={t('student.noQuizzesAvailable')} />
      ) : (
        <ul className="space-y-3">
          {filtered.map(({ quiz, attempts, best, canAttempt, course }) => {
            const passed = attempts.some((a) => a.passed);
            return (
              <li key={quiz.id} className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-100 text-sm">{localized(quiz.title, lang)}</h2>
                      {quiz.isRequired && <Badge color="amber">{t('quiz.requiredBadge')}</Badge>}
                      {passed && <Badge color="emerald">{t('student.passedLabel')}</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{localized(course?.title, lang)}</p>
                    <p className="text-[11px] text-slate-600 mt-1 tnum">
                      {attempts.length} {t('student.attempts')} · {t('student.bestScore')}: {best === null ? '—' : `${best}%`} · {t('quiz.passingScore')}: {quiz.passingScore}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attempts.length > 0 && (
                      <button onClick={() => setHistoryFor(historyFor === quiz.id ? null : quiz.id)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-100 border border-[#233047] hover:bg-[#1B2740]" aria-expanded={historyFor === quiz.id}>
                        <History size={14} aria-hidden="true" />{t('student.attemptHistory')}<ChevronDown size={12} className={`transition-transform ${historyFor === quiz.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    )}
                    {canAttempt ? (
                      <Link to={`/student/quizzes/${quiz.id}`}><button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[11px] font-black bg-[#10B981] hover:bg-[#059669] text-[#0B1120] transition-colors"><PlayCircle size={14} aria-hidden="true" />{attempts.length ? t('student.retryQuiz') : t('student.startQuiz')}</button></Link>
                    ) : (
                      <span className="text-[11px] text-red-400 font-bold">{t('student.maxAttemptsReached')}</span>
                    )}
                  </div>
                </div>
                {historyFor === quiz.id && (
                  <div className="mt-4 border-t border-[#1c2941] pt-3">
                    <table className="w-full text-[11px] text-slate-300 table-auto">
                      <thead><tr className="text-slate-500"><th className="text-start pb-2">#</th><th className="text-start pb-2">{t('student.dateCol')}</th><th className="text-start pb-2 hidden sm:table-cell">{t('student.scoreCol')}</th><th className="text-start pb-2">{t('student.percentageCol')}</th><th className="text-start pb-2">{t('student.resultCol')}</th></tr></thead>
                      <tbody>
                        {[...attempts].reverse().map((a) => (
                          <tr key={a.id} className="border-t border-[#1c2941]">
                            <td className="py-2 tnum">{a.attemptNumber}</td>
                            <td className="py-2 truncate max-w-28 text-[10px]">{formatDate(a.submittedAt, locale, { day: 'numeric', month: 'short' })}</td>
                            <td className="py-2 tnum hidden sm:table-cell">{formatNumber(a.score, locale)}/{formatNumber(a.totalPoints, locale)}</td>
                            <td className="py-2 tnum">{a.percentage}%</td>
                            <td className={`py-2 font-bold ${a.passed ? 'text-emerald-400' : 'text-red-400'}`}>{a.passed ? t('student.passedLabel') : t('student.failedLabel')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
