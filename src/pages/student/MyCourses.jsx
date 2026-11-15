import {Link} from "react-router-dom";
import {useMemo, useState} from "react";
import {Search, BookOpen, PlayCircle} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {enrollmentService} from "../../services/enrollmentService";
import {learningService} from "../../services/learningService";
import {courseService} from "../../services/courseService";
import {Input} from "../../components/common/FormControls";
import {
  Tabs,
  ProgressBar,
  StatusBadge,
  EmptyState,
} from "../../components/common/Feedback";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import {localized} from "../../utils/localized";

export default function MyCourses() {
  const {t, lang} = useLanguage();
  const {user} = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const items = useMemo(() => {
    return enrollmentService
      .getByStudent(user.id)
      .map((e) => ({
        ...e,
        course: courseService.getById(e.courseId),
        progress: learningService.getProgress(user.id, e.courseId),
      }))
      .filter((e) => e.course)
      .filter((e) => {
        if (filter === "inProgress")
          return e.progress.percentage > 0 && e.progress.percentage < 100;
        if (filter === "completed") return e.progress.percentage === 100;
        if (filter === "notStarted") return e.progress.percentage === 0;
        return true;
      })
      .filter(
        (e) =>
          !query.trim() ||
          localized(e.course.title, lang)
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      );
  }, [user.id, query, filter, lang]);

  const counts = useMemo(() => {
    const all = enrollmentService
      .getByStudent(user.id)
      .map((e) => learningService.getProgress(user.id, e.courseId).percentage);
    return {
      all: all.length,
      inProgress: all.filter((p) => p > 0 && p < 100).length,
      completed: all.filter((p) => p === 100).length,
      notStarted: all.filter((p) => p === 0).length,
    };
  }, [user.id]);

  const tabs = [
    {key: "all", label: t("student.filterAll"), count: counts.all},
    {
      key: "inProgress",
      label: t("student.filterInProgress"),
      count: counts.inProgress,
    },
    {
      key: "completed",
      label: t("student.filterCompleted"),
      count: counts.completed,
    },
    {
      key: "notStarted",
      label: t("student.filterNotStarted"),
      count: counts.notStarted,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("student.myCourses")}
        subtitle={t("student.myCoursesSubtitle")}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <Tabs tabs={tabs} active={filter} onChange={setFilter} />
        <div className="md:w-72">
          <Input
            dark
            icon={Search}
            placeholder={t("student.searchCourses")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("common.search")}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("student.noResults")}
          action={
            <Link to="/courses">
              <Button icon={PlayCircle}>{t("student.browseCourses")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(({course, progress}) => (
            <Link
              key={course.id}
              to={`/student/learn/${course.id}`}
              className="group rounded-2xl border border-[#1c2941] bg-dark-surface overflow-hidden hover:border-emerald-500/40 transition-all"
            >
              <div className="h-32 relative bg-dark-surface-2">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.opacity = 0;
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <span className="absolute top-3 inset-s-3">
                  <StatusBadge
                    status={
                      progress.percentage === 100
                        ? "completed"
                        : progress.percentage > 0
                          ? "inProgress"
                          : "notStarted"
                    }
                  />
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2 min-h-10 group-hover:text-emerald-400 transition-colors">
                  {localized(course.title, lang)}
                </h2>
                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
                  <span>{t("student.courseProgress")}</span>
                  <span className="font-black text-emerald-400 tnum">
                    {progress.percentage}%
                  </span>
                </div>
                <ProgressBar value={progress.percentage} className="mt-1.5" />
                <p className="text-[10px] text-slate-600 mt-2 tnum">
                  {progress.completedLessons}/{progress.totalLessons}{" "}
                  {t("courseDetail.lessons")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
