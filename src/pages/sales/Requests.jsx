import { useMemo, useState } from 'react';
import { Search, Inbox, Phone, Banknote, BadgeCheck, XCircle, StickyNote, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { subscriptionService } from '../../services/subscriptionService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { Input, Select, Textarea, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import { Tabs, EmptyState, ProgressBar } from '../../components/common/Feedback';
import Button from '../../components/common/Button';
import { formatNumber, formatDateTime, formatDate } from '../../utils/format';
import { localized } from '../../utils/localized';

const STAGE_KEYS = ['all', 'new', 'contacted', 'partial', 'paid', 'completed', 'rejected'];

export default function Requests() {
  const { t, lang, locale, isRTL } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  const [stage, setStage] = useState('all');
  const [query, setQuery] = useState('');
  const [courseId, setCourseId] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [payModal, setPayModal] = useState(null); // { id, amount }
  const [rejectModal, setRejectModal] = useState(null); // { id, reason }
  const [payAmount, setPayAmount] = useState('');
  const [noteText, setNoteText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const requests = useMemo(() => subscriptionService.getAll({ stage: stage === 'all' ? '' : stage, query, courseId }), [stage, query, courseId, tick]);
  const courses = useMemo(() => courseService.getAll(), []);
  const queryStr = query.toLowerCase();

  const counts = useMemo(() => ({
    all: subscriptionService.getAll().length,
    new: subscriptionService.getAll({ stage: 'new' }).length,
    contacted: subscriptionService.getAll({ stage: 'contacted' }).length,
    partial: subscriptionService.getAll({ stage: 'partial' }).length,
    paid: subscriptionService.getAll({ stage: 'paid' }).length,
    completed: subscriptionService.getAll({ stage: 'completed' }).length,
    rejected: subscriptionService.getAll({ stage: 'rejected' }).length,
  }), [tick]);

  const tabs = STAGE_KEYS.map((s) => ({ key: s, label: s === 'all' ? t('common.all') : t(`sales.stage${s[0].toUpperCase()}${s.slice(1)}`), count: counts[s] }));

  const selected = selectedId ? requests.find((r) => r.id === selectedId) || subscriptionService.getById(selectedId) : null;
  const selectedCourse = selected ? courseService.getById(selected.courseId) : null;
  const outstanding = (r) => Math.max(0, Number(r.amountDue || 0) - Number(r.amountPaid || 0));

  const openDetails = (r) => { setSelectedId(r.id); setPayAmount(''); setNoteText(''); setRejectReason(''); setRejectError(''); };

  const sendToContacted = () => { if (!selected) return; subscriptionService.setStage(selected.id, 'contacted'); toast.info(t('sales.moveToContacted')); refresh(); };
  const submitPayment = () => {
    if (!selected) return;
    if (!payAmount || Number(payAmount) <= 0) { toast.error(t('validation.positiveNumber')); return; }
    const res = subscriptionService.recordPayment(selected.id, Number(payAmount), { byUserId: user.id, method: 'cash' });
    if (res.ok) {
      toast.success(t('sales.recordPayment'));
      if (res.request.stage === 'paid') toast.success(t('sales.stagePaid'));
      setPayAmount('');
      setPayModal(null);
      refresh();
    } else toast.error(t('errors.generic'));
  };
  const complete = () => {
    if (!selected) return;
    const res = subscriptionService.completeSubscription(selected.id, { byUserId: user.id });
    if (res.ok) { toast.success(t('sales.markCompleted')); setSelectedId(null); refresh(); }
    else if (res.error === 'not_fully_paid') toast.warning('المبلغ المدفوع غير مكتمل بعد — سجّل دفعة أخرى أولاً');
    else toast.error(t('errors.generic'));
  };
  const reject = () => {
    if (!selected) return;
    if (!rejectReason.trim()) { setRejectError(t('admin.rejectReasonRequired')); return; }
    const res = subscriptionService.reject(selected.id, rejectReason, { byUserId: user.id });
    if (res.ok) { toast.success(t('sales.rejectRequest')); setRejectModal(null); refresh(); }
    else toast.error(t('errors.generic'));
  };
  const addNote = () => {
    if (!selected) return;
    if (!noteText.trim()) return;
    subscriptionService.addNote(selected.id, noteText, user.id);
    setNoteText('');
    refresh();
  };

  const stageTone = { new: 'amber', contacted: 'sky', partial: 'amber', paid: 'sky', completed: 'emerald', rejected: 'red' };

  return (
    <div>
      <PageHeader title={t('sales.requests')} subtitle={t('sales.pipelineTitle')} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <Tabs tabs={tabs} active={stage} onChange={setStage} />
        <div className="flex flex-col sm:flex-row gap-2">
          <Input dark icon={Search} placeholder={t('sales.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} className="sm:w-64" />
          <Select dark value={courseId} onChange={(e) => setCourseId(e.target.value)} aria-label={t('sales.courseFilter')} className="sm:w-44">
            <option value="">{t('sales.allCourses')}</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{localized(c.title, lang)}</option>)}
          </Select>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={Inbox} title={t('sales.noRequests')} dark />
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => {
            const course = courses.find((c) => c.id === r.courseId);
            return (
              <li key={r.id}>
                <button onClick={() => openDetails(r)} className="w-full text-start rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 hover:border-emerald-500/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar name={r.fullName} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-100">{r.fullName} <span className="text-[9px] text-slate-500 font-normal">· {r.phone}</span></p>
                      <p className="text-[10px] text-slate-500 truncate">{localized(course?.title, lang)} · {formatDate(r.createdAt, locale)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-slate-500">{stageLabel(r.stage, t)}</span>
                      <span className="text-[11px] font-black text-emerald-400 tnum">{formatNumber(r.amountPaid, locale)} / {formatNumber(r.amountDue, locale)} ج.م</span>
                      {r.amountPaid > 0 && r.amountPaid < r.amountDue && <ProgressBar value={Math.round((r.amountPaid / r.amountDue) * 100)} className="w-24" />}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Detail / action modal */}
      <Modal open={!!selectedId && !!selected} onClose={() => setSelectedId(null)} title={t('sales.detailsTitle')} size="lg">
        {selected && (
          <div className="grid gap-4">
            {/* Top */}
            <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-[#1c2941]">
              <Avatar name={selected.fullName} size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-100">{selected.fullName}</p>
                <p className="text-xs text-slate-500" dir="ltr">{selected.phone} · {selected.email}</p>
                <p className="text-[10px] text-slate-600">{formatDateTime(selected.createdAt, locale)}</p>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold border bg-[#1B2740] text-slate-300 border-[#2c3a55]">{stageLabel(selected.stage, t)}</span>
            </div>

            {/* Course + price */}
            <div className="rounded-xl border border-[#1c2941] bg-[#0B1120] p-3">
              <p className="text-xs font-bold text-slate-200">{localized(selectedCourse?.title, lang)}</p>
              <p className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                <span>{t('sales.amountDue')}: <span className="text-slate-200 font-bold tnum">{formatNumber(selected.amountDue, locale)} ج.م</span></span>
                <span>{t('sales.amountPaid')}: <span className="text-emerald-400 font-bold tnum">{formatNumber(selected.amountPaid, locale)} ج.م</span></span>
                <span>{t('sales.outstanding')}: <span className="text-amber-400 font-bold tnum">{formatNumber(Math.max(0, selected.amountDue - (selected.amountPaid || 0)), locale)} ج.م</span></span>
              </p>
            </div>

            {/* Notes */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{t('sales.notesTitle')}</p>
              <ul className="max-h-36 overflow-y-auto dark-scroll space-y-1 mb-2">
                {(selected.notes?.length ? selected.notes : [{ id: 'x', text: 'لا توجد ملاحظات', at: null }]).map((n) => (
                  <li key={n.id} className="text-[11px] text-slate-300 leading-5 border border-[#1c2941] rounded-lg px-2 py-1.5">{n.text}{n.at && <span className="block text-[9px] text-slate-600 mt-0.5">{formatDateTime(n.at, locale)}</span>}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input dark placeholder={t('sales.addNotePlaceholder')} value={noteText} onChange={(e) => setNoteText(e.target.value)} aria-label={t('sales.addNote')} />
                <Button size="sm" variant="secondary-dark" icon={StickyNote} onClick={addNote}>{t('sales.addNote')}</Button>
              </div>
            </div>

            {/* Action buttons */}
            {selected.stage !== 'completed' && (
              <div className="border-t border-[#1c2941] pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {!['paid', 'completed'].includes(selected.stage) && selected.stage !== 'rejected' && (
                  <Button variant="secondary-dark" icon={Phone} onClick={sendToContacted}>{t('sales.moveToContacted')}</Button>
                )}
                {selected.stage !== 'rejected' && (
                  <Button icon={Banknote} onClick={() => { setPayAmount(''); setPayModal({ id: selected.id }); }}>{t('sales.recordPayment')}</Button>
                )}
                {selected.stage !== 'rejected' && (
                  <Button icon={BadgeCheck} className="sm:col-span-2" onClick={complete}>{t('sales.completeSubscription')}</Button>
                )}
                {selected.stage !== 'rejected' && (
                  <Button variant="dangerOutline" icon={XCircle} onClick={() => setRejectModal({ id: selected.id })}>{t('sales.rejectRequest')}</Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment sub-modal */}
        <Modal open={!!payModal} onClose={() => setPayModal(null)} title={t('sales.recordPayment')} size="sm">
          <p className="text-xs text-slate-400 mb-3">{t('sales.paymentAmount')}: {selected && `${formatNumber(selected.amountDue - (selected.amountPaid || 0), locale)} ج.م متبقي`}</p>
          <FormField dark label={t('sales.paymentAmount')} htmlFor="payAmt" required>
            <Input dark id="payAmt" type="number" min={1} dir="ltr" className="text-start tnum" placeholder="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} autoFocus />
          </FormField>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary-dark" onClick={() => setPayModal(null)}>{t('common.cancel')}</Button>
            <Button icon={Banknote} onClick={submitPayment}>{t('sales.recordPayment')}</Button>
          </div>
        </Modal>

        {/* Reject sub-modal */}
        <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title={t('sales.rejectRequest')} size="sm">
          <p className="text-xs text-slate-400 mb-3">اكتب السبب الذي سيظهر للمطالب في إشعاره.</p>
          {rejectError && <p role="alert" className="text-xs text-red-400 font-bold mb-2">{rejectError}</p>}
          <FormField dark label={t('sales.rejectionReason')} htmlFor="rr" required>
            <Textarea dark id="rr" rows={3} dir="rtl" value={rejectReason} onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }} autoFocus />
          </FormField>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary-dark" onClick={() => setRejectModal(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" icon={XCircle} onClick={reject}>{t('sales.rejectRequest')}</Button>
          </div>
        </Modal>
      </Modal>
    </div>
  );
}

function stageLabel(stage, t) {
  const key = `sales.stage${stage[0].toUpperCase()}${stage.slice(1)}`;
  return t(key);
}
