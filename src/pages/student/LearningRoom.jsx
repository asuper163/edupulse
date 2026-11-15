import {useEffect, useMemo, useState} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  PlayCircle,
  FileText,
  ExternalLink,
  Lock,
  Menu,
  ListChecks,
  Award,
  CheckCircle2,
  Circle,
  GraduationCap,
} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {useToast} from "../../contexts/ToastContext";
import {courseService} from "../../services/courseService";
import {enrollmentService} from "../../services/enrollmentService";
import {learningService} from "../../services/learningService";
import {certificateService} from "../../services/certificateService";
import {quizService} from "../../services/quizService";
import Button from "../../components/common/Button";
import {ProgressBar, CircularProgress} from "../../components/common/Feedback";
import {localized} from "../../utils/localized";

export default function LearningRoom() {
  const {courseId} = useParams();
  const {t, lang, isRTL} = useLanguage();
  const {user} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const Chevron = isRTL ? ChevronRight : ChevronLeft;
  const ChevronNext = isRTL ? ChevronLeft : ChevronRight;

  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState(new Set([0]));

  const course = useMemo(
    () => courseService.getById(courseId),
    [courseId, tick],
  );
  const curriculum = useMemo(
    () => (course ? courseService.getCurriculum(course.id) : []),
    [course],
  );
  const flatLessons = useMemo(
    () =>
      curriculum.flatMap((s) =>
        s.lessons.map((l) => ({...l, sectionTitle: s.title})),
      ),
    [curriculum],
  );
  const progress = useMemo(
    () => learningService.getProgress(user.id, courseId),
    [user.id, courseId, tick],
  ); // eslint-disable-line
  const enrolled = enrollmentService.isEnrolled(user.id, courseId);

  const selected = flatLessons.find((l) => l.id === selectedId) || null;
  const selectedIndex = selected
    ? flatLessons.findIndex((l) => l.id === selected.id)
    : -1;
  const isCompleted = (lessonId) =>
    progress.completedLessonIds.includes(lessonId);

  // Redirect if no course / not enrolled
  useEffect(() => {
    if (!course) return;
    if (!enrolled) return;
    if (!selectedId) {
      const firstIncomplete = flatLessons.find(
        (l) => !progress.completedLessonIds.includes(l.id),
      );
      setSelectedId((firstIncomplete || flatLessons[0])?.id || null);
    }
  }, [course, enrolled, flatLessons, progress, selectedId]);

  if (!course) {
    return (
      <div className="text-center py-20 text-slate-400">
        {t("student.courseNotFound")}
      </div>
    );
  }
  if (!enrolled) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Lock
          size={44}
          className="text-slate-600 mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-slate-400 mb-5">{t("student.learnNotEnrolled")}</p>
        <Button
          onClick={() => navigate(`/courses/${course.id}`)}
          icon={GraduationCap}
        >
          {t("courseDetail.enrollCta")}
        </Button>
      </div>
    );
  }

  const toggleComplete = (lesson) => {
    const next = !isCompleted(lesson.id);
    const res = learningService.toggleLesson(
      user.id,
      courseId,
      lesson.id,
      next,
    );
    if (res.ok) {
      toast[next ? "success" : "info"](
        next ? t("student.lessonCompleted") : t("student.lessonUncompleted"),
      );
      // Check certificate eligibility after every progress change
      const cert = certificateService.checkAndIssue(user.id, courseId);
      if (cert.ok && cert.created)
        toast.success(
          t("student.certificateNo") +
            ": " +
            cert.certificate.certificateNumber,
        );
      setTick((v) => v + 1);
    }
  };

  const goTo = (i) => {
    if (i >= 0 && i < flatLessons.length) {
      setSelectedId(flatLessons[i].id);
      setSidebarOpen(false);
    }
  };
  const navBtn =
    "inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[#233047] text-xs font-bold text-slate-300 hover:bg-[#1B2740] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const lessonTypeIcon = (type) =>
    type === "video"
      ? PlayCircle
      : type === "external"
        ? ExternalLink
        : FileText;
  const sectionIndexOf = (lessonId) =>
    curriculum.findIndex((s) => s.lessons.some((l) => l.id === lessonId));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#1c2941]">
        <Link
          to="/student/courses"
          className="text-[10px] font-bold text-slate-500 hover:text-slate-300 inline-flex items-center gap-1"
        >
          <Chevron size={12} aria-hidden="true" />
          {t("student.myCourses")}
        </Link>
        <h1 className="text-sm font-black text-slate-100 leading-snug mt-1.5 line-clamp-2">
          {localized(course.title, lang)}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <ProgressBar value={progress.percentage} className="flex-1" />
          <span className="text-[10px] font-black text-emerald-400 tnum">
            {progress.percentage}%
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto dark-scroll p-2">
        {curriculum.map((section, si) => {
          const open = openSections.has(si);
          const sectionDone = section.lessons.filter((l) =>
            isCompleted(l.id),
          ).length;
          return (
            <div key={section.id} className="mb-1">
              <button
                onClick={() =>
                  setOpenSections((s) => {
                    const n = new Set(s);
                    open ? n.delete(si) : n.add(si);
                    return n;
                  })
                }
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-dark-surface-2"
              >
                <span className="text-start leading-snug">
                  {si + 1}. {localized(section.title, lang)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 tnum shrink-0">
                  {sectionDone}/{section.lessons.length}
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              {open && (
                <ul className="mt-0.5 space-y-0.5 ps-1">
                  {section.lessons.map((lesson) => {
                    const Icon = lessonTypeIcon(lesson.type);
                    const active = selected?.id === lesson.id;
                    const done = isCompleted(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => {
                            setSelectedId(lesson.id);
                            setSidebarOpen(false);
                          }}
                          aria-current={active ? "true" : undefined}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] leading-snug transition-colors ${active ? "bg-emerald-500/15 text-emerald-300 font-bold" : "text-slate-400 hover:bg-dark-surface-2 hover:text-slate-200"}`}
                        >
                          {done ? (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <Icon
                              size={14}
                              className="shrink-0 opacity-70"
                              aria-hidden="true"
                            />
                          )}
                          <span className="flex-1 text-start">
                            {localized(lesson.title, lang)}
                            {!lesson.isRequired && (
                              <span className="ms-1 text-[9px] text-slate-600">
                                ({t("common.optional")})
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="-m-4 sm:-m-6 flex min-h-[calc(100vh-4rem)]">
      {/* Curriculum sidebar — desktop */}
      <aside className="hidden lg:block w-80 xl:w-96 shrink-0 border-e border-[#1c2941] bg-[#111a2e]">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute inset-0 bg-black/60"
            aria-label={t("nav.closeMenu")}
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 inset-s-0 w-80 max-w-[85vw] bg-[#111a2e] border-e border-[#1c2941]">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Content toolbar */}
        <div className="h-14 flex items-center justify-between gap-2 px-4 sm:px-6 border-b border-[#1c2941] bg-dark-bg/80 backdrop-blur">
          <button
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-dark-surface-2"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("curriculumTitle")}
          >
            <Menu size={20} />
          </button>
          <p className="text-[11px] text-slate-500 truncate">
            {selected
              ? `${selectedIndex + 1} / ${flatLessons.length} — ${localized(selected.sectionTitle, lang)}`
              : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              className={navBtn}
              disabled={selectedIndex <= 0}
              onClick={() => goTo(selectedIndex - 1)}
            >
              <Chevron size={14} aria-hidden="true" />
              {t("student.prevLesson")}
            </button>
            <button
              className={navBtn}
              disabled={selectedIndex >= flatLessons.length - 1}
              onClick={() => goTo(selectedIndex + 1)}
            >
              {t("student.nextLesson")}
              <ChevronNext size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Lesson body */}
        {selected ? (
          <div className="flex-1 overflow-y-auto dark-scroll px-4 sm:px-8 py-6 max-w-4xl w-full mx-auto">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              {(() => {
                const Icon = lessonTypeIcon(selected.type);
                return <Icon size={12} aria-hidden="true" />;
              })()}
              {selected.type === "video"
                ? t("student.videoLesson")
                : selected.type === "external"
                  ? t("student.externalLesson")
                  : t("student.textLesson")}
              {!selected.isRequired && ` · ${t("student.optionalLesson")}`}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2 leading-snug">
              {localized(selected.title, lang)}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 leading-6">
              {localized(selected.description, lang)}
            </p>

            {/* Video area */}
            {selected.type === "video" && (
              <div className="mt-5 rounded-2xl overflow-hidden border border-dark-border bg-black aspect-video">
                {selected.videoUrl ? (
                  <iframe
                    src={selected.videoUrl}
                    title={localized(selected.title, lang)}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <PlayCircle size={44} aria-hidden="true" />
                    <span className="text-xs">{t("student.watchVideo")}</span>
                  </div>
                )}
              </div>
            )}
            {selected.type === "external" && (
              <a
                href={selected.videoUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#2c3a55] py-10 text-emerald-400 font-bold hover:bg-dark-surface-2 transition-colors"
              >
                <ExternalLink size={20} aria-hidden="true" />
                {t("student.openExternal")}
              </a>
            )}

            {/* Text content */}
            <div className="mt-5 rounded-2xl border border-[#1c2941] bg-dark-surface p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                {t("student.lessonContent")}
              </h3>
              <p className="text-sm text-slate-300 leading-8 whitespace-pre-line">
                {localized(selected.content, lang)}
              </p>
            </div>

            {/* Completion toggle */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant={
                  isCompleted(selected.id) ? "secondary-dark" : "primary"
                }
                onClick={() => toggleComplete(selected)}
                icon={isCompleted(selected.id) ? Circle : Check}
              >
                {isCompleted(selected.id)
                  ? t("student.markIncomplete")
                  : t("student.markComplete")}
              </Button>
              {progress.percentage === 100 && (
                <Link to="/student/quizzes" className="inline-flex">
                  <Button variant="secondary-dark" size="lg" icon={ListChecks}>
                    {t("student.myQuizzes")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            {t("common.noData")}
          </div>
        )}
      </div>

      {/* Progress rail — desktop */}
      <aside className="hidden xl:flex w-64 shrink-0 flex-col items-center gap-4 p-6 border-s border-[#1c2941] bg-[#111a2e]">
        <CircularProgress value={progress.percentage} size={120} stroke={11} />
        <div className="text-center">
          <p className="text-[11px] text-slate-500 font-semibold">
            {t("student.progressLabel")}
          </p>
          <p className="text-xs text-slate-400 mt-1 tnum">
            {progress.completedRequired}/{progress.totalRequired}{" "}
            {t("student.requiredLessons")}
          </p>
        </div>
        {progress.percentage === 100 && (
          <Link to="/student/certificates">
            <Button size="sm" icon={Award} className="w-full">
              {t("student.certificates")}
            </Button>
          </Link>
        )}
      </aside>
    </div>
  );
}
