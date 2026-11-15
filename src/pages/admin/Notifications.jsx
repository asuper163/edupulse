import { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notificationService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Input, Textarea, Select, FormField } from '../../components/common/FormControls';
import NotificationsList from '../shared/NotificationsList';

// Admin broadcast composer — ARABIC ONLY (single-language product decision).
// The message is stored in the bilingual { ar, en } shape; `en` mirrors Arabic.
export default function AdminNotifications() {
  const { t } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState({ titleAr: '', messageAr: '', audience: 'all' });
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const send = () => {
    if (!form.titleAr.trim() || !form.messageAr.trim()) { toast.error(t('validation.required')); return; }
    setSending(true);
    const created = notificationService.createForAudience(form.audience, {
      title: { ar: form.titleAr, en: form.titleAr },
      message: { ar: form.messageAr, en: form.messageAr },
      type: 'announcement',
    });
    setSending(false);
    setForm({ titleAr: '', messageAr: '', audience: 'all' });
    toast.success(t('admin.notificationSent', { count: created.length }));
  };

  return (
    <div className="grid xl:grid-cols-2 gap-6">
      {/* Composer */}
      <section className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 sm:p-6 h-fit">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 inline-flex items-center gap-2 mb-4"><Bell size={15} className="text-emerald-400" aria-hidden="true" />{t('admin.notificationsTitle')}</h2>
        <p className="text-[11px] text-slate-500 mb-4">{t('admin.notificationsSubtitle')}</p>
        <div className="grid gap-3">
          <FormField dark label={t('admin.notifTitleAr')} htmlFor="nAr" required><Input dark id="nAr" dir="rtl" value={form.titleAr} onChange={set('titleAr')} /></FormField>
          <FormField dark label={t('admin.notifMsgAr')} htmlFor="mAr" required><Textarea dark id="mAr" rows={4} dir="rtl" value={form.messageAr} onChange={set('messageAr')} /></FormField>
          <FormField dark label={t('admin.notifAudience')} htmlFor="aud">
            <Select dark id="aud" value={form.audience} onChange={set('audience')}>
              <option value="all">{t('admin.audienceAll')}</option>
              <option value="student">{t('admin.audienceStudents')}</option>
              <option value="instructor">{t('admin.audienceInstructors')}</option>
            </Select>
          </FormField>
          <div className="flex justify-end"><Button icon={Send} loading={sending} onClick={send}>{t('admin.sendNotification')}</Button></div>
        </div>
      </section>

      {/* Admin's own inbox */}
      <section className="max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('student.notificationsTitle')}</h2>
        </div>
        <NotificationsList hideHeader />
      </section>
    </div>
  );
}
