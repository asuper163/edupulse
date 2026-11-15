import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/index.jsx';
import { localized } from '../../utils/localized';
import { categoryService } from '../../services/categoryService';
import { courseService } from '../../services/courseService';
import { CATEGORY_ICONS, FALLBACK_CATEGORY_ICON } from '../../constants/categoryIcons';
import { BookOpenCheck } from 'lucide-react';

export default function Categories() {
  const { t, lang } = useLanguage();
  const categories = categoryService.getActive().map((c) => ({ ...c, publishedCount: courseService.getByCategory(c.id).length }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black text-slate-900">{t('categories.title')}</h1>
      <p className="text-slate-500 mt-1 mb-8">{t('categories.subtitle')}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.icon] || FALLBACK_CATEGORY_ICON;
          return (
            <Link key={cat.id} to={`/courses?category=${cat.id}`} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-emerald-300 hover:shadow-[0_14px_36px_rgb(16_185_129/0.14)] hover:-translate-y-0.5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Icon size={28} className="text-emerald-600" aria-hidden="true" />
              </div>
              <h2 className="font-bold text-slate-800 leading-snug">{localized(cat.name, lang)}</h2>
              <p className="text-xs text-slate-500 leading-6 mt-2 line-clamp-2 min-h-[3rem]">{localized(cat.description, lang)}</p>
              <p className="text-[11px] font-bold text-emerald-700 mt-3 tnum">{cat.publishedCount} {t('home.coursesCount')}</p>
            </Link>
          );
        })}
      </div>
      {categories.length === 0 && <p className="text-center text-slate-500 py-16">{t('common.noData')}</p>}
    </div>
  );
}
