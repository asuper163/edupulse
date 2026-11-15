import {Link, useParams, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {
  Star,
  Users,
  Layers,
  Clock,
  BookOpenCheck,
  PlayCircle,
  FileText,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  Lock,
  Heart,
  GraduationCap,
  Send,
  ListChecks,
} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {localized, localizedList} from "../../utils/localized";
import {
  formatWeeks,
  formatNumber,
  formatDate,
  formatPrice,
  finalPrice,
  timeAgo,
} from "../../utils/format";
import {courseService} from "../../services/courseService";
import {reviewService} from "../../services/reviewService";
import {enrollmentService} from "../../services/enrollmentService";
import {userService} from "../../services/userService";
import {storageAdapter} from "../../storage/storageAdapter";
import {quizService} from "../../services/quizService";
import {useAuth} from "../../contexts/AuthContext";
import {useToast} from "../../contexts/ToastContext";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import {
  Badge,
  StatusBadge,
  EmptyState,
  Tabs,
} from "../../components/common/Feedback";
import {CATEGORY_ICONS} from "../../constants/categoryIcons";

export default function CourseDetails() {
  const {courseId} = useParams();
  const {t, lang, locale} = useLanguage();
  const {user, isAuthenticated, role} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [openSections, setOpenSections] = useState(() => new Set([0]));
  const [wishlistIds, setWishlistIds] = useState([]);
  const [tick, setTick] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const course = useMemo(
    () => courseService.getById(courseId),
    [courseId, tick],
  );
  const curriculum = useMemo(
    () => (course ? courseService.getCurriculum(course.id) : []),
    [course],
  );

  useEffect(() => {
    if (isAuthenticated && role === "student" && user) {
      setWishlistIds(
        storageAdapter
          .getCollection("wishlist")
          .filter((w) => w.studentId === user.id)
          .map((w) => w.courseId),
      );
    }
  }, [isAuthenticated, role, user, courseId]);

  const canView =
    course &&
    (course.status === "published" ||
      (isAuthenticated &&
        (role === "admin" || user?.id === course.instructorId)));

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState
          dark={false}
          icon={BookOpenCheck}
          title={t("courseDetail.notFoundTitle")}
          hint={t("courseDetail.notFoundText")}
          action={
            <Link to="/courses">
              <Button variant="secondary">{t("nav.courses")}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const enrolled =
    isAuthenticated && role === "student"
      ? enrollmentService.isEnrolled(user.id, course.id)
      : false;
  const instructor = userService.getById(course.instructorId);
  const category = storageAdapter
    .getCollection("categories")
    .find((c) => c.id === course.categoryId);
  const CatIcon = category
    ? CATEGORY_ICONS[category.icon] || BookOpenCheck
    : BookOpenCheck;
  const reviews = reviewService.getForCourse(course.id);
  const userReview = isAuthenticated
    ? reviewService.getUserReview(user.id, course.id)
    : null;
  const wishlisted = wishlistIds.includes(course.id);
  const requiredQuizzes = quizService
    .getByCourse(course.id)
    .filter((q) => q.isRequired);

  const num = (n) => formatNumber(n, locale);
  const grossPrice = Number(course.price) || 0;
  const discountPct = Math.max(0, Math.min(100, Number(course.discount) || 0));
  const finalPriceValue = finalPrice(course);
  const toggleSection = (i) =>
    setOpenSections((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login", {state: {from: `/courses/${course.id}`}});
      return;
    }
    // Courses are paid — payment is handled offline by the sales team (cash only).
    navigate(`/request-subscription?courseId=${course.id}`);
  };

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const list = storageAdapter
      .getCollection("wishlist")
      .filter((w) => w.studentId === user.id);
    if (wishlisted) {
      const all = storageAdapter.getCollection("wishlist");
      storageAdapter.setCollection(
        "wishlist",
        all.filter(
          (w) => !(w.studentId === user.id && w.courseId === course.id),
        ),
      );
      setWishlistIds((ids) => ids.filter((id) => id !== course.id));
    } else {
      storageAdapter.insertInCollection("wishlist", {
        id: `wsh_${Date.now().toString(36)}`,
        studentId: user.id,
        courseId: course.id,
        createdAt: new Date().toISOString(),
      });
      setWishlistIds((ids) => [...ids, course.id]);
    }
  };

  const submitReview = () => {
    if (!rating) {
      toast.warning(t("validation.ratingRequired"));
      return;
    }
    const res = reviewService.create({
      studentId: user.id,
      courseId: course.id,
      rating,
      comment,
    });
    if (res.ok) {
      toast.success(t("courseDetail.reviewThanks"));
      setRating(0);
      setComment("");
      setTick((v) => v + 1);
    } else if (res.error === "not_enrolled")
      toast.error(t("courseDetail.reviewErrorEnroll"));
    else if (res.error === "duplicate")
      toast.warning(t("courseDetail.reviewErrorDup"));
    else toast.error(t("errors.generic"));
  };

  const lessonIcon = (type) =>
    type === "video"
      ? PlayCircle
      : type === "external"
        ? ExternalLink
        : FileText;

  return (
    <div>
      {/* ══ Course hero band ═══════════════════════════════ */}
      <section className="bg-dark-bg text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {category && (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CatIcon size={14} aria-hidden="true" />
                  {localized(category.name, lang)}
                </span>
              )}
              <Badge color="amber">
                {t(`courses.levels.${course.difficulty}`)}
              </Badge>
              <Badge color="emerald">{t("common.paid")}</Badge>
              <StatusBadge status={course.status} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight mt-4">
              {localized(course.title, lang)}
            </h1>
            <p className="text-slate-300 leading-7 mt-3 max-w-2xl">
              {localized(course.shortDescription, lang)}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 mt-5">
              <span className="inline-flex items-center gap-1.5">
                <Layers size={14} aria-hidden="true" />
                {course.sectionCount} {t("courseDetail.sections")} ·{" "}
                {course.lessonCount} {t("courseDetail.lessons")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} aria-hidden="true" />
                {formatWeeks(course.estimatedDuration)} ·{" "}
                {course.estimatedHours} ساعة · {course.projectCount} مشاريع
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} aria-hidden="true" />
                {num(course.enrollmentCount)} {t("courseDetail.students")}
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
                <Star size={14} fill="currentColor" aria-hidden="true" />
                {course.reviewCount ? course.avgRating.toFixed(1) : "—"} (
                {num(course.reviewCount)} {t("courseDetail.reviewsCount")})
              </span>
            </div>
            {instructor && (
              <Link
                to={`/instructors/${instructor.id}`}
                className="inline-flex items-center gap-3 mt-6 group"
              >
                <Avatar
                  name={instructor.name}
                  src={instructor.avatar}
                  size={46}
                />
                <span>
                  <span className="block text-[10px] text-slate-500">
                    {t("courses.instructor")}
                  </span>
                  <span className="block text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {instructor.name}
                  </span>
                </span>
              </Link>
            )}
          </div>
          {/* Sticky purchase card (on desktop) */}
          <div className="lg:justify-self-end w-full max-w-sm">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-dark-surface shadow-2xl">
              <div className="h-40 bg-linear-to-br from-emerald-500/30 to-teal-700/30 relative">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.opacity = 0;
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                {!enrolled && (
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mb-4 pb-4 border-b border-white/10">
                    <p className="text-3xl font-black text-emerald-400 tnum">
                      {formatPrice(finalPriceValue, locale)}
                    </p>
                    {discountPct > 0 && (
                      <>
                        <p className="text-sm text-slate-500 line-through tnum">
                          {formatPrice(grossPrice, locale)}
                        </p>
                        <span className="text-[10px] font-black text-amber-400 border border-amber-400/40 rounded-full px-2 py-0.5">
                          خصم {discountPct}%
                        </span>
                      </>
                    )}
                  </div>
                )}
                {enrolled ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/student/learn/${course.id}`)}
                    icon={PlayCircle}
                  >
                    {t("courseDetail.goToLearning")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleEnroll}
                    icon={GraduationCap}
                  >
                    {t("courseDetail.enrollCta")}
                  </Button>
                )}
                <button
                  onClick={toggleWishlist}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 hover:border-emerald-400/50 hover:text-emerald-400 transition-colors"
                  aria-pressed={wishlisted}
                >
                  <Heart
                    size={15}
                    fill={wishlisted ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  {wishlisted
                    ? t("courseDetail.wishlistRemove")
                    : t("courseDetail.wishlistAdd")}
                </button>
                <p className="text-[11px] text-emerald-400/90 font-semibold text-center mt-3">
                  ✓ {t("courseDetail.freeEnrollNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Tabs: overview / curriculum / reviews ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs
            tabs={[
              {key: "overview", label: t("courseDetail.overview")},
              {
                key: "curriculum",
                label: t("courseDetail.curriculum"),
                count: course.lessonCount,
              },
              {
                key: "reviews",
                label: t("courseDetail.reviews"),
                count: reviews.length,
              },
            ]}
            active={tab}
            onChange={setTab}
            dark={false}
          />

          {tab === "overview" && (
            <div className="mt-6 space-y-8">
              <div>
                <h2 className="font-black text-slate-900 text-lg">
                  {t("courseDetail.objectives")}
                </h2>
                <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                  {localizedList(course.learningObjectives, lang).map(
                    (o, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500 mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        {o}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <p className="text-slate-600 leading-8 whitespace-pre-line">
                {localized(course.description, lang)}
              </p>
              {localizedList(course.prerequisites, lang).length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800">
                    {t("courseDetail.prerequisites")}
                  </h3>
                  <ul className="list-disc ps-5 mt-2 text-sm text-slate-600 space-y-1">
                    {localizedList(course.prerequisites, lang).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {localizedList(course.requirements, lang).length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800">
                    {t("courseDetail.requirements")}
                  </h3>
                  <ul className="list-disc ps-5 mt-2 text-sm text-slate-600 space-y-1">
                    {localizedList(course.requirements, lang).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "curriculum" && (
            <div className="mt-6 space-y-3">
              {curriculum.map((section, si) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(si)}
                    aria-expanded={openSections.has(si)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <span>
                      {si + 1}. {localized(section.title, lang)}
                    </span>
                    <span className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                      <span>
                        {section.lessons.length} {t("courseDetail.lessons")}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openSections.has(si) ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                  {openSections.has(si) && (
                    <ul className="border-t border-slate-100 divide-y divide-slate-100">
                      {section.lessons.map((lesson) => {
                        const Icon = lessonIcon(lesson.type);
                        return (
                          <li
                            key={lesson.id}
                            className="flex items-center gap-3 px-5 py-3 text-sm"
                          >
                            <Icon
                              size={16}
                              className="text-slate-400 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="flex-1 text-slate-700">
                              {localized(lesson.title, lang)}
                              {!lesson.isRequired && (
                                <span className="ms-2 text-[10px] text-slate-400 font-semibold">
                                  ({t("student.optionalLesson")})
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-400 tnum">
                              {lesson.duration} {t("courseDetail.minutes")}
                            </span>
                            {!enrolled && (
                              <Lock
                                size={13}
                                className="text-slate-300"
                                aria-label={t("courseDetail.lockedLesson")}
                              />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
              {requiredQuizzes.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-3 text-sm text-emerald-800">
                  <ListChecks size={18} aria-hidden="true" />
                  {t("student.quizRequiredForCertificate")} (
                  {requiredQuizzes.length})
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="mt-6 space-y-4">
              {/* Write review (enrolled students only) */}
              {enrolled && !userReview && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                  <h3 className="font-bold text-slate-800">
                    {t("courseDetail.writeReview")}
                  </h3>
                  <div
                    className="flex gap-1.5 my-3"
                    role="radiogroup"
                    aria-label={t("courseDetail.yourRating")}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        role="radio"
                        aria-checked={rating === n}
                        onClick={() => setRating(n)}
                        className="p-0.5"
                      >
                        <Star
                          size={26}
                          fill={n <= rating ? "#F59E0B" : "none"}
                          className={
                            n <= rating ? "text-amber-500" : "text-slate-300"
                          }
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder={t("courseDetail.yourComment")}
                  />
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={submitReview}
                    icon={Send}
                  >
                    {t("courseDetail.submitReview")}
                  </Button>
                </div>
              )}
              {enrolled && userReview && (
                <p className="text-xs font-semibold text-emerald-700">
                  ✓ {t("courseDetail.reviewThanks")}
                </p>
              )}
              {!enrolled && (
                <p className="text-xs text-slate-500">
                  {t("courseDetail.reviewRequiresEnrollment")}
                </p>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  {t("courseDetail.noReviews")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => {
                    const author = userService.getById(r.studentId);
                    return (
                      <li
                        key={r.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={author?.name || "S"}
                              src={author?.avatar}
                              size={36}
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {author?.name || t("roles.student")}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {timeAgo(r.createdAt, locale)}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-amber-500 text-xs tracking-wider"
                            aria-label={`${r.rating}/5`}
                          >
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-slate-600 leading-6 mt-2">
                            {r.comment}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Side column — about instructor */}
        <aside className="space-y-4">
          {instructor && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                {t("courseDetail.aboutInstructor")}
              </h2>
              <div className="flex items-center gap-3">
                <Avatar
                  name={instructor.name}
                  src={instructor.avatar}
                  size={56}
                />
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {instructor.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t("instructors.memberSince")}{" "}
                    {formatDate(instructor.createdAt, locale, {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-6 mt-3 line-clamp-4">
                {instructor.bio}
              </p>
              <Link
                to={`/instructors/${instructor.id}`}
                className="mt-3 inline-flex text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                {t("instructors.viewProfile")} →
              </Link>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
