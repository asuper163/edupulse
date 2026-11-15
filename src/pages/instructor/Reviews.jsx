import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { storageAdapter } from '../../storage/storageAdapter';
import { userService } from '../../services/userService';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import { EmptyState, Badge } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { timeAgo } from '../../utils/format';

export default function Reviews() {
  const { t, lang, locale } = useLanguage();
  const { user } = useAuth();

  const data = useMemo(() => {
    const courses = courseService.getByInstructor(user.id);
    const coursesById = Object.fromEntries(courses.map((c) => [c.id, c]));
    const courseIds = courses.map((c) => c.id);
    return storageAdapter.getCollection('reviews')
      .filter((r) => courseIds.includes(r.courseId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((r) => ({ ...r, course: coursesById[r.courseId], student: userService.getById(r.studentId) }));
  }, [user.id]);

  return (
    <div>
      <PageHeader title={t('instructor.reviewsTitle')} subtitle={t('instructor.reviewsSubtitle')} />
      {data.length === 0 ? <EmptyState icon={Star} title={t('instructor.noReviewsYet')} /> : (
        <ul className="space-y-3 max-w-4xl">
          {data.map((review) => (
            <li key={review.id} className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={review.student?.name} src={review.student?.avatar} size={42} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100">{review.student?.name || t('roles.student')}</p>
                    <p className="text-[10px] text-slate-500 truncate">{localized(review.course?.title, lang)} · {timeAgo(review.createdAt, locale)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-xs tracking-widest" aria-label={`${review.rating}/5`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  {review.status === 'hidden' && <Badge color="amber">{t('status.hidden')}</Badge>}
                </div>
              </div>
              {review.comment && <p className="text-xs text-slate-300 leading-6 mt-3 border-t border-[#1c2941] pt-3">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
