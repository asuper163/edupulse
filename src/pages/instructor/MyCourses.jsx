import {Link, useNavigate} from "react-router-dom";
import {useMemo, useState} from "react";
import {
  Search,
  PlusCircle,
  Pencil,
  Send,
  Archive,
  Trash2,
  ListChecks,
  Layers3,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import CourseCard from "../../components/common/CourseCard";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {useToast} from "../../contexts/ToastContext";
import {courseService} from "../../services/courseService";
import {Tabs, StatusBadge, EmptyState} from "../../components/common/Feedback";
import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {Input} from "../../components/common/FormControls";
import {localized} from "../../utils/localized";

const STATUS_FILTERS = [
  "all",
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
];

export default function MyCourses() {
  const {t, lang} = useLanguage();
  const {user} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const courses = useMemo(() => {
    let list = courseService.getByInstructor(user.id);
    if (status !== "all") list = list.filter((c) => c.status === status);
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter((c) =>
        [c.title?.ar, c.title?.en]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [user.id, status, query, tick]);

  const all = useMemo(
    () => courseService.getByInstructor(user.id),
    [user.id, tick],
  );
  const tabs = STATUS_FILTERS.map((s) => ({
    key: s,
    label: s === "all" ? t("common.all") : t(`status.${s}`),
    count: s === "all" ? all.length : all.filter((c) => c.status === s).length,
  }));

  const submit = (course) => {
    const res = courseService.submitForApproval(course.id, {
      requesterId: user.id,
      requesterRole: user.role,
    });
    if (res.ok) {
      toast.success(t("instructor.courseSubmitted"));
      refresh();
    } else toast.error(t("errors.generic"));
  };
  const archive = (course) => {
    courseService.archive(course.id, {
      requesterId: user.id,
      requesterRole: user.role,
    });
    toast.info(t("instructor.courseArchived"));
    refresh();
  };
  const doDelete = () => {
    const res = courseService.remove(deleteId, {
      requesterId: user.id,
      requesterRole: user.role,
    });
    if (res.ok)
      toast.success(
        res.archived
          ? t("instructor.courseArchivedNote")
          : t("instructor.courseDeleted"),
      );
    else toast.error(t("errors.generic"));
    setDeleteId(null);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title={t("instructor.myCourses")}
        subtitle={t("instructor.coursesSubtitle")}
        actions={
          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#10B981] hover:bg-primary-hover text-dark-bg text-xs font-black transition-colors"
          >
            <PlusCircle size={15} aria-hidden="true" />
            {t("instructor.createCourse")}
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <Tabs tabs={tabs} active={status} onChange={setStatus} />
        <div className="md:w-72">
          <Input
            dark
            icon={Search}
            placeholder={t("instructor.searchCourses")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("common.search")}
          />
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("instructor.noCoursesMatch")}
          action={
            <Link
              to="/instructor/courses/create"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#10B981] text-dark-bg text-xs font-black"
            >
              <PlusCircle size={15} aria-hidden="true" />
              {t("instructor.createFirst")}
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              dark
              badge={<StatusBadge status={course.status} />}
              actions={
                <div className="space-y-2">
                  {course.status === "rejected" && course.rejectionReason && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-2 flex items-start gap-2">
                      <AlertCircle
                        size={14}
                        className="text-red-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="text-[10px] text-red-300 leading-5">
                        <span className="font-black">
                          {t("instructor.rejectionReason")}:{" "}
                        </span>
                        {localized(course.rejectionReason, lang)}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() =>
                        navigate(`/instructor/courses/${course.id}/edit`)
                      }
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[10px] font-bold text-slate-300 border border-dark-border hover:bg-dark-surface-2"
                    >
                      <Pencil size={12} aria-hidden="true" />
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/instructor/courses/${course.id}/curriculum`)
                      }
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[10px] font-bold text-slate-300 border border-dark-border hover:bg-dark-surface-2"
                    >
                      <Layers3 size={12} aria-hidden="true" />
                      {t("instructor.manageCurriculum")}
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/instructor/courses/${course.id}/quizzes`)
                      }
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[10px] font-bold text-slate-300 border border-dark-border hover:bg-dark-surface-2"
                    >
                      <ListChecks size={12} aria-hidden="true" />
                      {t("instructor.manageQuizzes")}
                    </button>
                    {["draft", "rejected"].includes(course.status) && (
                      <button
                        onClick={() => submit(course)}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[10px] font-black bg-amber-400/90 hover:bg-amber-400 text-amber-950"
                      >
                        <Send size={12} aria-hidden="true" />
                        {course.status === "rejected"
                          ? t("instructor.resubmit")
                          : t("instructor.submitForReview")}
                      </button>
                    )}
                    {course.status !== "archived" && (
                      <button
                        onClick={() => archive(course)}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[10px] font-bold text-slate-400 border border-dark-border hover:bg-dark-surface-2"
                        aria-label={t("instructor.archiveCourse")}
                      >
                        <Archive size={12} aria-hidden="true" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(course.id)}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[10px] font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10"
                      aria-label={t("instructor.deleteCourse")}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={doDelete}
        title={t("instructor.confirmDeleteTitle")}
        message={t("instructor.confirmDeleteText")}
        confirmLabel={t("common.delete")}
        danger
      />
    </div>
  );
}
