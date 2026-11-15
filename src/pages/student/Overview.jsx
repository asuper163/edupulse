import {Link} from "react-router-dom";
import {useMemo} from "react";
import {
  BookOpenCheck,
  Loader,
  CheckCircle2,
  Award,
  Bell,
  ChevronRight,
  ChevronLeft,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {enrollmentService} from "../../services/enrollmentService";
import {learningService} from "../../services/learningService";
import {certificateService} from "../../services/certificateService";
import {courseService} from "../../services/courseService";
import {quizService} from "../../services/quizService";
import {notificationService} from "../../services/notificationService";
import {storageAdapter} from "../../storage/storageAdapter";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/common/PageHeader";
import {
  CircularProgress,
  ProgressBar,
  EmptyState,
} from "../../components/common/Feedback";
import {localized} from "../../utils/localized";

export default function StudentOverview() {
  const {t, lang, locale, isRTL} = useLanguage();
  const {user} = useAuth();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const data = useMemo(() => {
    const enrollments = enrollmentService.getByStudent(user.id);
    const withProgress = enrollments.map((e) => ({
      ...e,
      course: courseService.getById(e.courseId),
      progress: learningService.getProgress(user.id, e.courseId),
    }));
    const inProgress = withProgress.filter(
      (e) => e.progress.percentage > 0 && e.progress.percentage < 100,
    );
    const completed = withProgress.filter(
      (e) => e.progress.percentage === 100 || e.status === "completed",
    );
    const certificates = certificateService.getByStudent(user.id);
    const overall = withProgress.length
      ? Math.round(
          withProgress.reduce((s, e) => s + e.progress.percentage, 0) /
            withProgress.length,
        )
      : 0;
    const weekly = learningService.getWeeklyActivity(user.id);
    const dayFmt = new Intl.DateTimeFormat(locale, {weekday: "short"});
    const chartData = weekly.map((d) => ({
      day: dayFmt.format(new Date(d.day)),
      lessons: d.count,
    }));
    const notifications = notificationService.getForUser(user.id).slice(0, 4);
    // Quizzes available on enrolled courses (published)
    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const allQuizzes = quizService
      .getAll()
      .filter(
        (q) =>
          enrolledCourseIds.includes(q.courseId) && q.status === "published",
      );
    const availableQuizzes = allQuizzes
      .filter(
        (q) =>
          quizService.canAttempt(q.id, user.id).ok &&
          !quizService.hasPassed(q.id, user.id),
      )
      .slice(0, 3);
    const recent = learningService
      .getRecentlyActiveCourses(user.id, 3)
      .filter((r) => r.progress.percentage < 100);
    return {
      withProgress,
      inProgress,
      completed,
      certificates,
      overall,
      chartData,
      notifications,
      availableQuizzes,
      recent,
      totalLessons: storageAdapter.getCollection("lessons").length,
    };
  }, [user.id, locale]);

  return (
    <div>
      {/* Welcome banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-l from-emerald-500/15 via-dark-surface to-dark-surface p-5 sm:p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            {t("student.welcomeBack")}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
            {user.name} 👋
          </h1>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
        >
          {t("student.browseCourses")}
          <Chevron size={15} aria-hidden="true" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={BookOpenCheck}
          label={t("student.enrolledCount")}
          value={data.withProgress.length}
          tone="emerald"
        />
        <StatCard
          icon={Loader}
          label={t("student.inProgressCount")}
          value={data.inProgress.length}
          tone="sky"
        />
        <StatCard
          icon={CheckCircle2}
          label={t("student.completedCount")}
          value={data.completed.length}
          tone="violet"
        />
        <StatCard
          icon={Award}
          label={t("student.certificatesCount")}
          value={data.certificates.length}
          tone="amber"
        />
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Weekly activity chart */}
          <div className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2">
                <BarChart3
                  size={16}
                  className="text-emerald-400"
                  aria-hidden="true"
                />
                {t("student.weeklyActivity")}
              </h2>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{top: 5, right: 5, left: -18, bottom: 0}}
                >
                  <defs>
                    <linearGradient id="lessonFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop
                        offset="100%"
                        stopColor="#10B981"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#1c2941"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{fill: "#64748B", fontSize: 11}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{fill: "#64748B", fontSize: 11}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1B2740",
                      border: "1px solid #2c3a55",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{color: "#F1F5F9"}}
                  />
                  <Area
                    type="monotone"
                    dataKey="lessons"
                    name={t("courseDetail.lessons")}
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#lessonFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Continue learning */}
          <div className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-200 text-sm">
                {t("student.recentlyAccessed")}
              </h2>
              <Link
                to="/student/courses"
                className="text-[11px] font-bold text-emerald-400 inline-flex items-center gap-1"
              >
                {t("home.viewAll")}
                <Chevron size={13} aria-hidden="true" />
              </Link>
            </div>
            {data.recent.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                {t("student.noCoursesYet")}
              </p>
            ) : (
              <ul className="divide-y divide-[#1c2941]">
                {data.recent.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/student/learn/${item.courseId}`}
                      className="flex items-center gap-3 py-3 group"
                    >
                      <img
                        src={item.course?.thumbnail}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                        className="w-16 h-12 object-cover rounded-lg bg-dark-surface-2 shrink-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                          {localized(item.course?.title, lang)}
                        </span>
                        <span className="block mt-1.5">
                          <ProgressBar value={item.progress.percentage} />
                        </span>
                      </span>
                      <span className="text-[11px] font-black text-emerald-400 tnum">
                        {item.progress.percentage}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Overall progress ring */}
          <div className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5 flex items-center gap-5">
            <CircularProgress value={data.overall} size={104} stroke={10} />
            <div>
              <h2 className="font-bold text-slate-200 text-sm">
                {t("student.overallProgress")}
              </h2>
              <p className="text-[11px] text-slate-500 leading-5 mt-1">
                {t("student.overallProgressHint")}
              </p>
            </div>
          </div>

          {/* Available quizzes */}
          <div className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5">
            <h2 className="font-bold text-slate-200 text-sm mb-2">
              {t("student.availableQuizzes")}
            </h2>
            {data.availableQuizzes.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                {t("student.noQuizzesAvailable")}
              </p>
            ) : (
              <ul className="divide-y divide-[#1c2941]">
                {data.availableQuizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      to={`/student/quizzes/${quiz.id}`}
                      className="flex items-center justify-between gap-2 py-2.5 group"
                    >
                      <span className="text-xs font-semibold text-slate-300 truncate group-hover:text-emerald-400">
                        {localized(quiz.title, lang)}
                      </span>
                      <Chevron
                        size={14}
                        className="text-slate-600 group-hover:text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent notifications */}
          <div className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2">
                <Bell
                  size={15}
                  className="text-emerald-400"
                  aria-hidden="true"
                />
                {t("student.recentNotifications")}
              </h2>
              <Link
                to="/student/notifications"
                className="text-[11px] font-bold text-emerald-400"
              >
                {t("home.viewAll")}
              </Link>
            </div>
            {data.notifications.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                {t("student.noNotifications")}
              </p>
            ) : (
              <ul className="divide-y divide-[#1c2941]">
                {data.notifications.map((n) => (
                  <li key={n.id} className="py-2.5 flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.isRead ? "bg-slate-700" : "bg-emerald-400"}`}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] leading-5 text-slate-300">
                      {localized(n.title, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
