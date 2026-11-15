import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {Heart, Trash2, PlayCircle} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {courseService} from "../../services/courseService";
import {storageAdapter} from "../../storage/storageAdapter";
import {EmptyState} from "../../components/common/Feedback";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import {localized} from "../../utils/localized";

export default function Wishlist() {
  const {t, lang} = useLanguage();
  const {user} = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const load = () => {
    const saved = storageAdapter
      .getCollection("wishlist")
      .filter((w) => w.studentId === user.id);
    setItems(
      saved
        .map((w) => ({...w, course: courseService.getById(w.courseId)}))
        .filter((x) => x.course),
    );
  };
  useEffect(load, [user.id]);

  const remove = (courseId) => {
    const all = storageAdapter.getCollection("wishlist");
    storageAdapter.setCollection(
      "wishlist",
      all.filter((w) => !(w.studentId === user.id && w.courseId === courseId)),
    );
    load();
  };

  return (
    <div>
      <PageHeader
        title={t("student.wishlistTitle")}
        subtitle={t("student.wishlistSubtitle")}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t("student.wishlistEmpty")}
          hint={t("student.wishlistEmptyHint")}
          action={
            <Button icon={PlayCircle} onClick={() => navigate("/courses")}>
              {t("student.browseCourses")}
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(({course}) => (
            <div
              key={course.id}
              className="group rounded-2xl border border-[#1c2941] bg-dark-surface overflow-hidden"
            >
              <Link
                to={`/courses/${course.id}`}
                className="block h-32 relative bg-dark-surface-2"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.opacity = 0;
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                )}
              </Link>
              <div className="p-4">
                <Link to={`/courses/${course.id}`}>
                  <h2 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2 min-h-10 hover:text-emerald-400 transition-colors">
                    {localized(course.title, lang)}
                  </h2>
                </Link>
                <div className="flex items-center justify-between mt-3">
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    {t("common.details")} →
                  </Link>
                  <button
                    onClick={() => remove(course.id)}
                    aria-label={t("student.removeFromWishlist")}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
