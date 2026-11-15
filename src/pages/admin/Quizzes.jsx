import { useMemo, useState } from 'react';
import { ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { quizService } from '../../services/quizService';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import { EmptyState, Badge } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { formatDate } from '../../utils/format';

export default function AdminQuizzes() {
  const { t, lang, locale } = useLanguage();
  const [expanded, setExpanded] = useState(null);

  const quizzes = useMemo(() => quizService.getAll().map((q) => ({
    ...q,
    course: courseService.getById(q.courseId),
    questions: quizService.getQuestions(q.id),
    attempts: quizService.getAttempts(q.id).length,
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), []);

  return (
    <div>
      <PageHeader title={t('admin.quizzesTitle')} subtitle={t('admin.quizzesSubtitle')} />
      {quizzes.length === 0 ? <EmptyState icon={ListChecks} title={t('common.noData')} /> : (
        <ul className="space-y-2 max-w-4xl">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="rounded-2xl border border-[#1c2941] bg-[#151F32] overflow-hidden">
              <button onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)} aria-expanded={expanded === quiz.id} className="w-full flex items-center gap-3 px-4 py-3.5 text-start hover:bg-[#182238] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">{localized(quiz.title, lang)}</p>
                  <p className="text-[10px] text-slate-500 truncate">{localized(quiz.course?.title, lang)} · {formatDate(quiz.createdAt, locale, { month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="text-[10px] text-slate-500 tnum shrink-0">{quiz.questions.length} {t('admin.questionsCount')} · {quiz.attempts} {t('admin.attemptsCount')}</span>
                {quiz.isRequired && <Badge color="amber">{t('quiz.requiredBadge')}</Badge>}
                {expanded === quiz.id ? <ChevronUp size={16} className="text-slate-500" aria-hidden="true" /> : <ChevronDown size={16} className="text-slate-500" aria-hidden="true" />}
              </button>
              {expanded === quiz.id && (
                <ol className="border-t border-[#1c2941] divide-y divide-[#1c2941]">
                  {quiz.questions.map((q, i) => (
                    <li key={q.id} className="px-4 py-2.5 flex items-start gap-2.5 text-[11px]">
                      <span className="w-5 h-5 shrink-0 rounded bg-[#1B2740] text-[9px] font-black text-slate-500 flex items-center justify-center tnum">{i + 1}</span>
                      <span className="text-slate-300 leading-5">{localized(q.question, lang)}<span className="block text-[9px] text-slate-600 mt-0.5">{q.points} {t('quiz.points')} · {q.type === 'truefalse' ? t('quiz.trueFalse') : t('quiz.multipleChoice')}</span></span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
