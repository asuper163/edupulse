import { Star, Clock3, Hourglass, FolderGit2, CheckCircle2, Layers, Users, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/index.jsx';
import { localized } from '../../utils/localized';
import { formatWeeks, formatPrice, finalPrice } from '../../utils/format';
import { Badge } from './Feedback';

// Course card — same structure as the EraaSoft reference:
// big image + category pill on the image + floating white stats bar
// (weeks · hours · projects) overlapping the image bottom, then title,
// description and a free/CTA footer. Renders as a link publicly; renders
// as a plain article when `actions` are provided (instructor dashboard).
export default function CourseCard({ course, dark = false, enrolled = false, badge, actions }) {
  const { t, lang, locale } = useLanguage();
  const num = (n) => new Intl.NumberFormat(locale).format(n || 0);

  const shell = dark
    ? 'border-[#1c2941] bg-[#151F32] hover:border-emerald-500/40'
    : 'border-slate-200/80 bg-white shadow-[0_1px_3px_rgb(15_23_42/0.06)] hover:shadow-[0_18px_44px_rgb(15_23_42/0.14)] hover:-translate-y-0.5';
  const titleCls = dark ? 'text-slate-100 group-hover:text-emerald-400' : 'text-slate-800 group-hover:text-emerald-700';
  const subCls = dark ? 'text-slate-400' : 'text-slate-500';
  const barCls = dark ? 'bg-[#1B2740] border-[#2c3a55] text-slate-100' : 'bg-white border-slate-100 text-slate-800 shadow-[0_10px_30px_rgb(15_23_42/0.12)]';
  const footCls = dark ? 'border-[#1c2941] text-slate-400' : 'border-slate-100 text-slate-500';
  const category = localized(course.categoryName, lang);
  const final = finalPrice(course);

  const inner = (
    <>
      {/* Image with pills */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-900 shrink-0">
        {course.thumbnail && (
          <img src={course.thumbnail} alt={localized(course.title, lang)} loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
        )}
        {/* dark gradient for pill legibility */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
        {category && (
          <span className="absolute top-3 start-3 z-10 max-w-[70%] truncate rounded-full border border-white/20 bg-black/55 backdrop-blur px-3 py-1.5 text-[10px] font-bold text-white">{category}</span>
        )}
        {badge && <div className="absolute top-3 end-3 z-10">{badge}</div>}
      </div>

      {/* Floating stats bar overlapping the image (EraaSoft-style) */}
      <div className={`relative z-10 mx-3 -mt-5 flex items-center justify-between gap-1 rounded-2xl border px-3 py-2 ${barCls}`}>
        <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold whitespace-nowrap"><Clock3 size={14} className="text-emerald-500" aria-hidden="true" />{formatWeeks(course.estimatedDuration)}</span>
        <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold whitespace-nowrap"><Hourglass size={14} className="text-emerald-500" aria-hidden="true" />{num(course.estimatedHours)} ساعة</span>
        <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold whitespace-nowrap"><FolderGit2 size={14} className="text-emerald-500" aria-hidden="true" />{num(course.projectCount)} مشاريع</span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 pt-3">
        <h3 className={`font-extrabold text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.6rem] transition-colors ${titleCls}`}>{localized(course.title, lang)}</h3>
        <p className={`text-[11px] leading-5 mt-1 line-clamp-2 min-h-[2.5rem] ${subCls}`}>{localized(course.shortDescription, lang)}</p>
        <div className={`mt-auto flex items-center justify-between gap-2 pt-3 mt-3 border-t text-[10px] ${footCls}`}>
          <span className="inline-flex items-center gap-1 tnum"><Layers size={11} aria-hidden="true" />{num(course.lessonCount)} {t('courseDetail.lessons')}</span>
          <span className="inline-flex items-center gap-1 tnum"><Users size={11} aria-hidden="true" />{num(course.enrollmentCount)}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-500"><Star size={11} fill="currentColor" aria-hidden="true" />{course.reviewCount ? course.avgRating.toFixed(1) : '—'}</span>
          {enrolled && <Badge color="sky">{t('courses.enrolledBadge')}</Badge>}
          {!enrolled && (
            <span className="inline-flex items-center gap-1 font-black text-emerald-500 tnum"><Tag size={11} aria-hidden="true" />{formatPrice(final, locale)}</span>
          )}
        </div>
        {actions && <div className={`border-t mt-3 pt-3 ${dark ? 'border-[#1c2941]' : 'border-slate-100'}`}>{actions}</div>}
      </div>
    </>
  );

  if (actions) {
    return <article className={`group flex flex-col rounded-2xl border overflow-hidden transition-colors ${shell}`}>{inner}</article>;
  }
  return (
    <Link to={`/courses/${course.id}`} className={`group flex flex-col rounded-2xl border overflow-hidden transition-all focus-visible:outline-2 focus-visible:outline-[#10B981] ${shell}`}>
      {inner}
    </Link>
  );
}
