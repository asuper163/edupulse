import {Link, useNavigate} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  BookOpenCheck,
  Award,
  CheckCircle2,
  Star,
  Quote,
  ChevronDown,
  Rocket,
  UserPlus,
  TrendingUp,
  ShieldCheck,
  Languages,
  BadgeCheck,
  Wallet,
  Clock3,
} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {localized} from "../../utils/localized";
import {formatNumber} from "../../utils/format";
import {courseService} from "../../services/courseService";
import {categoryService} from "../../services/categoryService";
import {storageAdapter} from "../../storage/storageAdapter";
import {reviewService} from "../../services/reviewService";
import {userService} from "../../services/userService";
import CourseCard from "../../components/common/CourseCard";
import {Pagination} from "../../components/common/Feedback";
import Avatar from "../../components/common/Avatar";
import {CATEGORY_ICONS} from "../../constants/categoryIcons";

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(
        Math.round(
          ((target * (1 - Math.pow(2, -8 * p))) / (1 - Math.pow(2, -8))) *
            (p === 1 ? 1 : 1),
        ),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Stat({value, label, icon: Icon, locale}) {
  const n = useCountUp(value);
  return (
    <div className="flex flex-col items-center text-center px-2">
      <Icon size={22} className="text-emerald-500 mb-2" aria-hidden="true" />
      <p className="text-2xl sm:text-3xl font-black text-slate-900 tnum">
        {formatNumber(n, locale)}
      </p>
      <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">
        {label}
      </p>
    </div>
  );
}

export default function Home() {
  const {t, isRTL, locale, lang} = useLanguage();
  const {isAuthenticated, role} = useAuth();
  const navigate = useNavigate();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [openFaq, setOpenFaq] = useState(0);
  const [featuredPage, setFeaturedPage] = useState(1);

  const data = useMemo(() => {
    const featured = [...courseService.getPublished()].sort(
      (a, b) => b.enrollmentCount - a.enrollmentCount,
    );
    const published = featured;
    const cats = categoryService.getActive().map((c) => ({
      ...c,
      publishedCount: courseService.getByCategory(c.id).length,
    }));
    const instructors = userService
      .getAll({role: "instructor"})
      .map((u) => {
        const courses = courseService
          .getByInstructor(u.id)
          .filter((c) => c.status === "published");
        const studentCount = new Set(
          storageAdapter
            .getCollection("enrollments")
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
      })
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 4);
    const reviews = storageAdapter
      .getCollection("reviews")
      .filter((r) => r.status === "visible" && r.comment)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    const users = storageAdapter.getCollection("users");
    return {
      featured,
      cats,
      instructors,
      reviews,
      counts: {
        students:
          users.filter((u) => u.role === "student").length +
          storageAdapter.getCollection("enrollments").length,
        courses: published.length,
        instructors: users.filter((u) => u.role === "instructor").length,
        certificates: storageAdapter.getCollection("certificates").length,
      },
    };
  }, []);

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`home.faq${i}Q`),
    a: t(`home.faq${i}A`),
  }));
  const testimonials = data.reviews.map((r) => ({
    ...r,
    author: userService.getById(r.studentId),
  }));
  const FEATURED_PER_PAGE = 6;
  const featuredTotalPages = Math.max(
    1,
    Math.ceil(data.featured.length / FEATURED_PER_PAGE),
  );
  const featuredPageItems = data.featured.slice(
    (featuredPage - 1) * FEATURED_PER_PAGE,
    featuredPage * FEATURED_PER_PAGE,
  );

  return (
    <div>
      {/* ══ HERO ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-light-bg">
        <div
          aria-hidden="true"
          className="absolute -top-40 -inset-s-404w-136m] h-136 rounded-full bg-emerald-100/70 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -inset-e-40 w-xl h-144 rounded-full bg-teal-100/60 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-start">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
              <Sparkles size={14} aria-hidden="true" /> {t("home.heroBadge")}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.15] text-slate-900 tracking-tight">
              {t("home.heroTitle")}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-l from-emerald-500 to-teal-600">
                {t("home.heroTitleAccent")}
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-8 max-w-xl">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex h-12 px-6 items-center gap-2 rounded-2xl bg-[#10B981] hover:bg-primary-hover text-white font-bold shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                {t("home.exploreCta")} <Arrow size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/register"
                className="inline-flex h-12 px-6 items-center gap-2 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 font-bold bg-white/60 backdrop-blur transition-all"
              >
                <GraduationCap size={18} aria-hidden="true" />{" "}
                {t("home.becomeInstructorCta")}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                {t("home.benefit1Title")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                {t("home.benefit2Title")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                {t("home.benefit3Title")}
              </span>
            </div>
          </div>

          {/* Hero visual: floating course card composition */}
          <div className="relative h-95 sm:h-110" aria-hidden="true">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-[3rem] bg-linear-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 flex items-center justify-center rotate-3">
                <span className="text-[5rem] sm:text-[7rem] font-black text-white/90 select-none">
                  EP
                </span>
              </div>
            </div>
            <div className="absolute top-4 inset-s-2 sm:inset-s-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 -rotate-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Star
                  className="text-emerald-600"
                  size={20}
                  fill="currentColor"
                />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 tnum">
                  4.8 / 5
                </p>
                <p className="text-[10px] text-slate-500">{t("home.rating")}</p>
              </div>
            </div>
            <div className="absolute top-1/3 inset-e-0 sm:inset-e-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 rotate-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <BadgeCheck className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 tnum">
                  {formatNumber(data.counts.certificates, locale)}+
                </p>
                <p className="text-[10px] text-slate-500">
                  {t("home.statsCertificates")}
                </p>
              </div>
            </div>
            <div className="absolute bottom-10 inset-s-6 sm:inset-s-16 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 rotate-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {t("home.step2Title")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════ */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat
            value={data.counts.students}
            label={t("home.statsStudents")}
            icon={Users}
            locale={locale}
          />
          <Stat
            value={data.counts.courses}
            label={t("home.statsCourses")}
            icon={BookOpenCheck}
            locale={locale}
          />
          <Stat
            value={data.counts.instructors}
            label={t("home.statsInstructors")}
            icon={GraduationCap}
            locale={locale}
          />
          <Stat
            value={data.counts.certificates}
            label={t("home.statsCertificates")}
            icon={Award}
            locale={locale}
          />
        </div>
      </section>

      {/* ══ FEATURED COURSES ═══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t("home.featuredTitle")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("home.featuredSubtitle")}
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
          >
            {t("home.viewAll")} <Arrow size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredPageItems.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <Pagination
          page={featuredPage}
          totalPages={featuredTotalPages}
          onChange={(p) => setFeaturedPage(p)}
          dark={false}
        />
      </section>

      {/* ══ CATEGORIES ═════════════════════════════════════ */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl font-black text-slate-900">
            {t("home.categoriesTitle")}
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {t("home.categoriesSubtitle")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {data.cats.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] || BookOpenCheck;
              return (
                <Link
                  key={cat.id}
                  to={`/courses?category=${cat.id}`}
                  className="group rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-emerald-300 hover:shadow-[0_10px_30px_rgb(16_185_129/0.12)] transition-all bg-light-bg hover:bg-white"
                >
                  <Icon
                    size={26}
                    className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-sm text-slate-800 leading-snug">
                    {localized(cat.name, lang)}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 tnum">
                    {cat.publishedCount} {t("home.coursesCount")}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ INSTRUCTORS ═════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t("home.instructorsTitle")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("home.instructorsSubtitle")}
            </p>
          </div>
          <Link
            to="/instructors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
          >
            {t("home.viewAll")} <Arrow size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.instructors.map((ins) => (
            <Link
              key={ins.id}
              to={`/instructors/${ins.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <Avatar
                name={ins.name}
                src={ins.avatar}
                size={72}
                className="mx-auto"
              />
              <h3 className="font-bold text-slate-800 mt-3 text-sm">
                {ins.name}
              </h3>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 line-clamp-1">
                {ins.bio?.split(/[.—]/)[0]}
              </p>
              <p className="text-[10px] text-slate-500 mt-2 tnum">
                {ins.courseCount} {t("home.coursesCount")} ·{" "}
                {formatNumber(ins.studentCount, locale)}{" "}
                {t("home.studentsCount")}
                {ins.avgRating ? ` · ★ ${ins.avgRating.toFixed(1)}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="bg-dark-bg text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-black text-center">
            {t("home.howTitle")}
          </h2>
          <p className="text-sm text-slate-400 text-center mt-1 mb-10">
            {t("home.howSubtitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Rocket,
                title: t("home.step1Title"),
                text: t("home.step1Text"),
              },
              {
                icon: Clock3,
                title: t("home.step2Title"),
                text: t("home.step2Text"),
              },
              {
                icon: Award,
                title: t("home.step3Title"),
                text: t("home.step3Text"),
              },
            ].map(({icon: Icon, title, text}, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-white/10 bg-dark-surface p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
                  <Icon
                    size={26}
                    className="text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-slate-400 leading-6 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-3">
          {t("home.benefitsTitle")}
        </h2>
        <p className="text-sm sm:text-base text-slate-500 text-center max-w-2xl mx-auto mb-10 leading-7">
          {t("home.benefitsSubtitle")}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Wallet,
              title: t("home.benefit1Title"),
              text: t("home.benefit1Text"),
            },
            {
              icon: Languages,
              title: t("home.benefit2Title"),
              text: t("home.benefit2Text"),
            },
            {
              icon: Award,
              title: t("home.benefit3Title"),
              text: t("home.benefit3Text"),
            },
            {
              icon: ShieldCheck,
              title: t("home.benefit4Title"),
              text: t("home.benefit4Text"),
            },
            {
              icon: Clock3,
              title: t("home.benefit5Title"),
              text: t("home.benefit5Text"),
            },
            {
              icon: TrendingUp,
              title: t("home.benefit6Title"),
              text: t("home.benefit6Text"),
            },
          ].map(({icon: Icon, title, text}, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon
                  size={22}
                  className="text-emerald-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-6 mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">
              {t("home.testimonialsTitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((review) => (
                <figure
                  key={review.id}
                  className="rounded-2xl border border-slate-200 p-6 bg-light-bg flex flex-col"
                >
                  <Quote
                    size={22}
                    className="text-emerald-400 mb-3"
                    aria-hidden="true"
                  />
                  <blockquote className="text-sm text-slate-700 leading-7 flex-1">
                    “{review.comment}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
                    <Avatar
                      name={review.author?.name || "S"}
                      src={review.author?.avatar}
                      size={40}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {review.author?.name || t("roles.student")}
                      </p>
                      <p className="text-[10px] text-amber-600 font-bold">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ FAQ ═════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-8">
          {t("home.faqTitle")}
        </h2>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                aria-expanded={openFaq === i}
                className="w-full flex items-center justify-between gap-4 text-start px-5 py-4 font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                {item.q}
                <ChevronDown
                  size={18}
                  className={`shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-7 border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl bg-linear-to-l from-emerald-600 via-emerald-500 to-teal-600 px-6 sm:px-12 py-14 text-center text-white shadow-2xl shadow-emerald-500/30">
          <h2 className="text-2xl sm:text-4xl font-black">
            {t("home.ctaTitle")}
          </h2>
          <p className="mt-2 text-emerald-50">{t("home.ctaSubtitle")}</p>
          <button
            onClick={() =>
              navigate(
                isAuthenticated
                  ? role === "admin"
                    ? "/admin"
                    : role === "instructor"
                      ? "/instructor"
                      : "/student"
                  : "/register",
              )
            }
            className="mt-6 inline-flex h-12 px-8 items-center gap-2 rounded-2xl bg-white text-emerald-700 font-black hover:bg-emerald-50 transition-colors"
          >
            <UserPlus size={18} aria-hidden="true" /> {t("home.ctaButton")}
          </button>
        </div>
      </section>
    </div>
  );
}
