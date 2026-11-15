import {useMemo, useState} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Trophy,
  XCircle,
  ListChecks,
  GraduationCap,
} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {useToast} from "../../contexts/ToastContext";
import {quizService} from "../../services/quizService";
import {courseService} from "../../services/courseService";
import {enrollmentService} from "../../services/enrollmentService";
import {certificateService} from "../../services/certificateService";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import {Badge} from "../../components/common/Feedback";
import {localized} from "../../utils/localized";

export default function QuizAttempt() {
  const {quizId} = useParams();
  const {t, lang, isRTL} = useLanguage();
  const {user} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [tick, setTick] = useState(0);

  const quiz = useMemo(() => quizService.getById(quizId), [quizId, tick]);
  const questions = useMemo(
    () => (quiz ? quizService.getQuestions(quiz.id) : []),
    [quiz],
  );
  const course = quiz ? courseService.getById(quiz.courseId) : null;
  const gate = quiz ? quizService.canAttempt(quiz.id, user.id) : {ok: false};
  const attemptNumber = quiz
    ? quizService.attemptsUsed(quiz.id, user.id) + 1
    : 1;

  if (!quiz || !course) {
    return (
      <div className="text-center py-20 text-slate-400">
        {t("errors.generic")}
      </div>
    );
  }
  // Must be enrolled in the course to attempt its quiz
  if (!enrollmentService.isEnrolled(user.id, course.id)) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <GraduationCap
          size={44}
          className="text-slate-600 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-slate-400 mb-5">{t("student.learnNotEnrolled")}</p>
        <Button onClick={() => navigate(`/courses/${course.id}`)}>
          {t("courseDetail.enrollCta")}
        </Button>
      </div>
    );
  }

  // ── Result screen ──────────────────────────────────────────────────
  if (result) {
    const passed = result.attempt.passed;
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div
          className={`rounded-3xl border p-8 sm:p-12 text-center ${passed ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
        >
          {passed ? (
            <Trophy
              size={64}
              className="text-amber-400 mx-auto"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              size={64}
              className="text-red-400 mx-auto"
              aria-hidden="true"
            />
          )}
          <h1 className="text-2xl font-black text-slate-100 mt-4">
            {passed ? t("quiz.resultPassed") : t("quiz.resultFailed")}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {localized(quiz.title, lang)}
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <p className="text-4xl font-black text-slate-100 tnum">
                {result.attempt.percentage}
                <span className="text-lg text-slate-500">%</span>
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                {t("quiz.percentage")}
              </p>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-100 tnum">
                {result.attempt.score}
                <span className="text-lg text-slate-500">
                  /{result.attempt.totalPoints}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                {t("quiz.yourScore")}
              </p>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-100 tnum">
                {t("quiz.attemptOf", {n: result.attempt.attemptNumber})}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                {t("student.attempts")}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-6">
            {passed
              ? t("quiz.passedReq")
              : t("quiz.failedReq", {score: quiz.passingScore})}
          </p>
          <div className="flex justify-center gap-3 mt-7">
            <Button
              variant="secondary-dark"
              onClick={() => navigate("/student/quizzes")}
              icon={ListChecks}
            >
              {t("quiz.backToQuizzes")}
            </Button>
            {passed && (
              <Link to="/student/certificates">
                <Button icon={Trophy}>{t("student.certificates")}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!gate.ok) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <ClipboardList
          size={44}
          className="text-slate-600 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-slate-300 font-bold">
          {t("student.maxAttemptsReached")}
        </p>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {t("quiz.maxAttempts")}: {quiz.maxAttempts}
        </p>
        <Button
          variant="secondary-dark"
          onClick={() => navigate("/student/quizzes")}
        >
          {t("quiz.backToQuizzes")}
        </Button>
      </div>
    );
  }

  const question = questions[current];
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined,
  ).length;
  const setAnswer = (value) =>
    setAnswers((a) => ({...a, [question.id]: value}));

  const doSubmit = () => {
    const res = quizService.submitAttempt({
      quizId: quiz.id,
      studentId: user.id,
      answers,
    });
    setConfirmOpen(false);
    if (!res.ok) {
      toast.error(
        res.error === "max_attempts"
          ? t("student.maxAttemptsReached")
          : t("errors.generic"),
      );
      return;
    }
    // After a pass, certificate may now be issuable
    if (res.attempt.passed)
      certificateService.checkAndIssue(user.id, course.id);
    setResult(res);
    setTick((v) => v + 1);
  };

  return (
    <div>
      <PageHeader
        title={localized(quiz.title, lang)}
        subtitle={localized(course.title, lang)}
        actions={
          <Badge color="sky">{t("quiz.attemptOf", {n: attemptNumber})}</Badge>
        }
      />
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Question panel */}
        <div className="lg:col-span-2 rounded-2xl border border-[#1c2941] bg-dark-surface p-5 sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 tnum">
            {t("quiz.questionOf", {
              current: current + 1,
              total: questions.length,
            })}{" "}
            · {question?.points} {t("quiz.points")}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug mt-2">
            {localized(question?.question, lang)}
          </h2>

          <fieldset className="mt-5 space-y-2.5">
            <legend className="sr-only">{t("quiz.selectAnswer")}</legend>
            {question?.type === "truefalse" &&
              [true, false].map((value) => (
                <label
                  key={String(value)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all ${answers[question.id] === value ? "border-emerald-500 bg-emerald-500/10" : "border-dark-border hover:border-[#31435f]"}`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    className="accent-emerald-500 w-4 h-4"
                    checked={answers[question.id] === value}
                    onChange={() => setAnswer(value)}
                  />
                  <span className="text-sm font-semibold text-slate-200">
                    {value
                      ? t("instructor.trueLabel")
                      : t("instructor.falseLabel")}
                  </span>
                </label>
              ))}
            {question?.type !== "truefalse" &&
              (question?.options?.[lang] || question?.options?.ar || []).map(
                (option, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all ${answers[question.id] === i ? "border-emerald-500 bg-emerald-500/10" : "border-dark-border hover:border-[#31435f]"}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      className="accent-emerald-500 w-4 h-4"
                      checked={answers[question.id] === i}
                      onChange={() => setAnswer(i)}
                    />
                    <span className="w-6 h-6 rounded-lg bg-dark-surface-2 text-[11px] font-black text-slate-400 flex items-center justify-center shrink-0 tnum">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-slate-200">{option}</span>
                  </label>
                ),
              )}
          </fieldset>

          <div className="flex items-center justify-between gap-2 mt-6">
            <button
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-dark-border text-xs font-bold text-slate-300 hover:bg-dark-surface-2 disabled:opacity-40"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              <PrevIcon size={15} aria-hidden="true" />
              {t("quiz.prevQuestion")}
            </button>
            {current < questions.length - 1 ? (
              <button
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-dark-border text-xs font-bold text-slate-300 hover:bg-dark-surface-2"
                onClick={() =>
                  setCurrent((c) => Math.min(questions.length - 1, c + 1))
                }
              >
                {t("quiz.nextQuestion")}
                <NextIcon size={15} aria-hidden="true" />
              </button>
            ) : (
              <Button onClick={() => setConfirmOpen(true)} icon={Check}>
                {t("quiz.submitQuiz")}
              </Button>
            )}
          </div>
        </div>

        {/* Question palette + meta */}
        <aside className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5 h-fit">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {t("quiz.questionPalette")}
          </h2>
          <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-2 mt-3">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                aria-label={`${t("quiz.questionOf", {current: i + 1, total: questions.length})}`}
                aria-current={i === current ? "true" : undefined}
                className={`h-9 rounded-lg text-[11px] font-black tnum transition-all ${i === current ? "ring-2 ring-emerald-400 scale-105" : ""} ${answers[q.id] !== undefined ? "bg-emerald-500 text-dark-bg" : "bg-dark-surface-2 text-slate-500 hover:text-slate-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              {t("quiz.answered")} ({answeredCount})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-dark-surface-2" />
              {t("quiz.unanswered")} ({questions.length - answeredCount})
            </span>
          </div>
          <div className="border-t border-[#1c2941] mt-4 pt-4 text-[11px] text-slate-400 space-y-1.5">
            <p className="flex justify-between">
              <span>{t("quiz.passingScore")}</span>
              <span className="font-bold text-slate-200 tnum">
                {quiz.passingScore}%
              </span>
            </p>
            <p className="flex justify-between">
              <span>{t("quiz.maxAttempts")}</span>
              <span className="font-bold text-slate-200 tnum">
                {quiz.maxAttempts === 0
                  ? t("quiz.unlimitedAttempts")
                  : quiz.maxAttempts}
              </span>
            </p>
            <p className="text-slate-600 leading-5 pt-1">
              {t("quiz.timeNote")}
            </p>
          </div>
          <Button
            variant="secondary-dark"
            className="w-full mt-4"
            onClick={() => setConfirmOpen(true)}
            icon={Check}
          >
            {t("quiz.submitQuiz")}
          </Button>
        </aside>
      </div>

      {/* Submit confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        title={t("quiz.confirmSubmitTitle")}
        message={t("quiz.confirmSubmitText")}
        confirmLabel={t("quiz.submitQuiz")}
        danger={false}
      >
        {questions.length - answeredCount > 0 && (
          <p className="mt-2 text-amber-400 font-semibold">
            {t("quiz.unansweredWarning", {
              count: questions.length - answeredCount,
            })}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
