import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Send, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, ListChecks } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { courseService } from '../../services/courseService';
import { subscriptionService } from '../../services/subscriptionService';
import { localized } from '../../utils/localized';
import { formatPrice } from '../../utils/format';
import { Select, Input, Textarea, FormField } from '../../components/common/FormControls';
import Button from '../../components/common/Button';
import { EmptyState } from '../../components/common/Feedback';
import { GraduationCap } from 'lucide-react';

export default function RequestSubscription() {
  const { t, lang, isRTL, locale } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('courseId') || '';

  const publishedCourses = useMemo(() => courseService.getPublished(), []);
  const [courseId, setCourseId] = useState(preselected || publishedCourses[0]?.id || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <EmptyState dark={false} icon={GraduationCap} title={t('subscription.loginRequired')} action={<Link to="/login"><Button icon={ArrowLeft}>{t('subscription.loginToContinue')}</Button></Link>} />
      </div>
    );
  }

  const selected = publishedCourses.find((c) => c.id === courseId);
  const num = (n) => new Intl.NumberFormat(locale).format(n || 0);

  const submit = () => {
    if (!selected) { toast.error(t('validation.selectRequired')); return; }
    if (!fullName.trim() || !phone.trim() || !email.trim()) { toast.error(t('validation.required')); return; }
    const phoneOk = /^01[0-2,5][0-9]{8}$/.test(phone.trim());
    if (!phoneOk) { toast.error(t('validation.minLength', { min: 11 })); return; }
    setSaving(true);
    const res = subscriptionService.create({ studentId: user.id, fullName, phone, email, courseId: selected.id, note: notes });
    setSaving(false);
    if (res.ok) {
      setSubmitted(res.request);
      toast.success(t('subscription.successTitle'));
    } else {
      toast.error(t('errors.generic'));
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 size={64} className="text-emerald-500 mx-auto" aria-hidden="true" />
        <h1 className="text-3xl font-black text-slate-900 mt-5">{t('subscription.successTitle')}</h1>
        <p className="text-slate-600 mt-2 leading-7">{t('subscription.successText')}</p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm text-start">
          <div>
            <p className="text-xs text-slate-500">{t('sales.requestTitle')}</p>
            <p className="font-bold text-slate-800">{localized(selected?.title, lang)}</p>
            <p className="text-sm text-emerald-700 font-black tnum">{formatPrice(selected ? subscriptionService.priceOf(selected) : 0, locale)}</p>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-8">
          <Link to="/courses"><Button variant="secondary">{t('nav.courses')}</Button></Link>
          <Link to="/student/notifications"><Button>{t('student.notifications')}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6"><BackIcon size={14} aria-hidden="true" />{t('nav.courses')}</Link>
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="grid lg:grid-cols-5">
          {/* Summary column */}
          <aside className="lg:col-span-2 bg-[#0B1120] text-slate-100 p-6 sm:p-8 flex flex-col">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400"><ShieldCheck size={13} aria-hidden="true" />اشتراك مدفوع — كاش فقط</span>
            <h1 className="text-2xl sm:text-3xl font-black leading-snug mt-3">{t('subscription.pageTitle')}</h1>
            <p className="text-sm text-slate-400 leading-7 mt-2">{t('subscription.pageSubtitle')}</p>
            {selected && (
              <div className="rounded-2xl border border-white/10 bg-[#151F32] p-4 mt-6">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('courseDetail.overview')}</p>
                <p className="text-sm font-bold text-slate-100 mt-1">{localized(selected.title, lang)}</p>
                <p className="text-xs text-slate-400 mt-1 leading-6">{localized(selected.shortDescription, lang)}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  <p className="text-2xl font-black text-emerald-400 tnum">{formatPrice(subscriptionService.priceOf(selected), locale)}</p>
                  {Number(selected.discount) > 0 && <span className="text-xs font-bold text-slate-500 line-through">{formatPrice(Number(selected.price), locale)}</span>}
                </div>
              </div>
            )}
            <ul className="mt-6 space-y-2 text-[11px] text-slate-400">
              <li className="flex items-start gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />بعد وصول طلبك هنتواصل معاك لتأكيد التسجيل</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />الدفع كاش فقط بعد مراجعة طلبك</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />السعر شامل كامل الدورة والمتابعة والشهادة</li>
            </ul>
          </aside>
          {/* Form column */}
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="lg:col-span-3 p-6 sm:p-8 grid gap-4" noValidate>
            <FormField label={t('subscription.chooseCourse')} htmlFor="crs" required>
              <Select id="crs" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                {publishedCourses.map((c) => <option key={c.id} value={c.id}>{localized(c.title, lang)} — {formatPrice(subscriptionService.priceOf(c), locale)}</option>)}
              </Select>
            </FormField>
            <FormField label={t('subscription.fullName')} htmlFor="fname" required>
              <Input id="fname" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={t('subscription.phone')} htmlFor="phone" required>
                <Input id="phone" type="tel" dir="ltr" className="text-start" inputMode="numeric" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FormField>
              <FormField label={t('subscription.email')} htmlFor="email" required>
                <Input id="email" type="email" dir="ltr" className="text-start" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormField>
            </div>
            <FormField label={t('subscription.notes')} htmlFor="note">
              <Textarea id="note" rows={3} placeholder={t('subscription.notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FormField>
            <Button type="submit" size="lg" loading={saving} icon={Send} className="w-full">{t('subscription.submit')}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
