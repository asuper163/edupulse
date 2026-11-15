import { useMemo, useState } from 'react';
import { Star, Eye, EyeOff, Trash2, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { reviewService } from '../../services/reviewService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { Input, Select } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState, Badge } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { timeAgo } from '../../utils/format';

export default function Reviews() {
  const { t, lang, locale } = useLanguage();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmHide, setConfirmHide] = useState(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const reviews = useMemo(() => {
    const list = reviewService.getAll({ query, rating, status });
    return list.map((r) => ({ ...r, course: courseService.getById(r.courseId), student: userService.getById(r.studentId) }));
  }, [query, rating, status, tick]);

  const toggleHide = (r) => {
    if (r.status === 'visible') { setConfirmHide(r); return; }
    reviewService.setStatus(r.id, 'visible');
    toast.success(t('admin.reviewRestored'));
    refresh();
  };
  const doHide = () => { reviewService.setStatus(confirmHide.id, 'hidden'); toast.success(t('admin.reviewHidden')); setConfirmHide(null); refresh(); };
  const doDelete = () => { reviewService.remove(confirmDelete.id); toast.success(t('admin.reviewDeleted')); setConfirmDelete(null); refresh(); };

  return (
    <div>
      <PageHeader title={t('admin.reviewsTitle')} subtitle={t('admin.reviewsSubtitle')} />
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="flex-1"><Input dark icon={Search} placeholder={t('admin.searchReviews')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>
        <Select dark value={rating} onChange={(e) => setRating(Number(e.target.value))} aria-label={t('admin.filterRating')} className="sm:w-40">
          <option value={0}>{t('admin.allRatings')}</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
        </Select>
        <Select dark value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('common.status')} className="sm:w-40">
          <option value="">{t('common.all')}</option>
          <option value="visible">{t('status.visible')}</option>
          <option value="hidden">{t('status.hidden')}</option>
        </Select>
      </div>

      {reviews.length === 0 ? <EmptyState icon={Star} title={t('common.noData')} /> : (
        <ul className="space-y-2 max-w-4xl">
          {reviews.map((review) => (
            <li key={review.id} className={`rounded-2xl border p-4 flex flex-wrap items-start gap-3 ${review.status === 'hidden' ? 'border-amber-500/20 bg-amber-500/5 opacity-80' : 'border-[#1c2941] bg-[#151F32]'}`}>
              <Avatar name={review.student?.name} src={review.student?.avatar} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-slate-100">{review.student?.name}</p>
                  <span className="text-amber-400 text-[10px] tracking-widest">{'★'.repeat(review.rating)}</span>
                  {review.status === 'hidden' && <Badge color="amber">{t('status.hidden')}</Badge>}
                  <span className="text-[9px] text-slate-600">{timeAgo(review.createdAt, locale)}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{localized(review.course?.title, lang)}</p>
                {review.comment && <p className="text-[11px] text-slate-300 leading-5 mt-1.5">{review.comment}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => toggleHide(review)} aria-label={review.status === 'visible' ? t('admin.hideReview') : t('admin.restoreReview')} title={review.status === 'visible' ? t('admin.hideReview') : t('admin.restoreReview')}>{review.status === 'visible' ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmDelete(review)} aria-label={t('admin.deleteReview')}><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={!!confirmHide} onClose={() => setConfirmHide(null)} onConfirm={doHide} title={t('admin.hideReview')} message={t('admin.confirmHideReview')} confirmLabel={t('admin.hideReview')} danger />
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} title={t('admin.deleteReview')} message={t('admin.confirmDeleteReview')} confirmLabel={t('common.delete')} danger />
    </div>
  );
}
