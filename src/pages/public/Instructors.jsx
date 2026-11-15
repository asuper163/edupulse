import {Link} from "react-router-dom";
import {useMemo} from "react";
import {Star, Users, BookOpenCheck} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {storageAdapter} from "../../storage/storageAdapter";
import {userService} from "../../services/userService";
import {courseService} from "../../services/courseService";
import {reviewService} from "../../services/reviewService";
import {formatNumber} from "../../utils/format";
import Avatar from "../../components/common/Avatar";

export default function Instructors() {
  const {t, locale} = useLanguage();
  const instructors = useMemo(() => {
    const enrollments = storageAdapter.getCollection("enrollments");
    return userService
      .getAll({role: "instructor", status: "active"})
      .map((u) => {
        const courses = courseService
          .getByInstructor(u.id)
          .filter((c) => c.status === "published");
        const studentCount = new Set(
          enrollments
            .filter((e) => courses.some((c) => c.id === e.courseId))
            .map((e) => e.studentId),
        ).size;
        const ratingVals = courses.flatMap((c) => {
          const {average, count} = reviewService.averageForCourse(c.id);
          return count ? [average] : [];
        });
        const avg = ratingVals.length
          ? ratingVals.reduce((s, v) => s + v, 0) / ratingVals.length
          : 0;
        return {
          ...u,
          courseCount: courses.length,
          studentCount,
          avgRating: avg,
        };
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black text-slate-900">
        {t("instructors.title")}
      </h1>
      <p className="text-slate-500 mt-1 mb-8">{t("instructors.subtitle")}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {instructors.map((ins) => (
          <Link
            key={ins.id}
            to={`/instructors/${ins.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-center hover:border-emerald-300 hover:shadow-[0_14px_36px_rgb(16_185_129/0.14)] hover:-translate-y-0.5 transition-all"
          >
            <Avatar
              name={ins.name}
              src={ins.avatar}
              size={88}
              className="mx-auto"
            />
            <h2 className="font-bold text-slate-800 mt-4">{ins.name}</h2>
            <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[2.2rem] leading-snug mt-1">
              {ins.bio}
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-3">
              <span className="inline-flex items-center gap-1 tnum">
                <BookOpenCheck size={13} aria-hidden="true" />
                {ins.courseCount}
              </span>
              <span className="inline-flex items-center gap-1 tnum">
                <Users size={13} aria-hidden="true" />
                {formatNumber(ins.studentCount, locale)}
              </span>
              <span className="inline-flex items-center gap-1 tnum font-semibold text-amber-600">
                <Star size={13} fill="currentColor" aria-hidden="true" />
                {ins.avgRating ? ins.avgRating.toFixed(1) : "—"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
