import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, BookOpenCheck, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentService } from '../../services/enrollmentService';
import CourseCard from '../../components/common/CourseCard';
import { Input, Select } from '../../components/common/FormControls';
import { EmptyState, Pagination } from '../../components/common/Feedback';
import Button from '../../components/common/Button';
import { localized } from '../../utils/localized';

const PER_PAGE = 9;

export default function Courses() {
  const { t, lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [instructorId, setInstructorId] = useState(searchParams.get('instructor') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating') || 0));
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  // Sync filters → URL (shareable, refresh-safe)
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (categoryId) params.category = categoryId;
    if (instructorId) params.instructor = instructorId;
    if (difficulty) params.difficulty = difficulty;
    if (minRating) params.rating = String(minRating);
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [query, categoryId, instructorId, difficulty, minRating, sort]); // eslint-disable-line

  const categories = useMemo(() => categoryService.getActive(), []);
  const instructors = useMemo(() => userService.getAll({ role: 'instructor' }), []);

  const results = useMemo(
    () => courseService.searchFilter({ query, categoryId, instructorId, difficulty, minRating, sort, status: 'published' }),
    [query, categoryId, instructorId, difficulty, minRating, sort]
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const pageItems = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const enrolledIds = useMemo(() => (isAuthenticated ? new Set(enrollmentService.getByStudent(user.id).map((e) => e.courseId)) : new Set()), [isAuthenticated, user]);

  const hasFilters = query || categoryId || instructorId || difficulty || minRating || sort !== 'newest';
  const clearAll = () => { setQuery(''); setCategoryId(''); setInstructorId(''); setDifficulty(''); setMinRating(0); setSort('newest'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">{t('courses.title')}</h1>
        <p className="text-slate-500 mt-1">{t('courses.subtitle')}</p>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('courses.searchPlaceholder')} aria-label={t('common.search')} />
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label={t('courses.category')} className="md:w-44">
              <option value="">{t('courses.allCategories')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{localized(c.name, lang)}</option>)}
            </Select>
            <Select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} aria-label={t('courses.instructor')} className="md:w-40">
              <option value="">{t('courses.allInstructors')}</option>
              {instructors.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label={t('courses.difficulty')} className="md:w-36">
              <option value="">{t('courses.allLevels')}</option>
              <option value="beginner">{t('courses.levels.beginner')}</option>
              <option value="intermediate">{t('courses.levels.intermediate')}</option>
              <option value="advanced">{t('courses.levels.advanced')}</option>
            </Select>
            <Select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} aria-label={t('courses.minRating')} className="md:w-32">
              <option value={0}>{t('courses.anyRating')}</option>
              <option value={4}>4.0+ ★</option>
              <option value={4.5}>4.5+ ★</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('courses.sortBy')} className="md:w-40">
              <option value="newest">{t('courses.sortNewest')}</option>
              <option value="popular">{t('courses.sortPopular')}</option>
              <option value="rating">{t('courses.sortRating')}</option>
              <option value="title">{t('courses.sortTitle')}</option>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          <p className="text-xs text-slate-500 inline-flex items-center gap-2"><SlidersHorizontal size={13} aria-hidden="true" />{results.length} {t('common.results')} · {t('courses.publishedOnly')}</p>
          {hasFilters && <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"><X size={13} aria-hidden="true" />{t('common.clearFilters')}</button>}
        </div>
      </div>

      {/* Grid */}
      {pageItems.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {pageItems.map((course) => <CourseCard key={course.id} course={course} enrolled={enrolledIds.has(course.id)} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} dark={false} />
        </>
      ) : (
        <div className="mt-8"><EmptyState icon={BookOpenCheck} title={t('courses.noResults')} hint={t('courses.noResultsHint')} dark={false} action={<Button variant="secondary" onClick={clearAll} icon={X}>{t('common.clearFilters')}</Button>} /></div>
      )}
    </div>
  );
}
