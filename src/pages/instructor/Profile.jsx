import { useState } from 'react';
import { Save } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import { Input, Textarea, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';

export default function InstructorProfile() {
  const { t, locale } = useLanguage();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name || '', avatar: user.avatar || '', bio: user.bio || '', phone: user.phone || '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.name.trim()) { toast.error(t('validation.required')); return; }
    setSaving(true);
    updateProfile(form);
    setSaving(false);
    toast.success(t('student.profileSaved'));
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('instructor.profile')} subtitle={t('student.profileSubtitle')} />
      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 sm:p-7">
        <div className="flex items-center gap-5 pb-5 border-b border-[#1c2941]">
          <Avatar name={form.name || user.name} src={form.avatar} size={76} />
          <div>
            <p className="font-black text-lg text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{t('student.memberSince')}: {formatDate(user.createdAt, locale)}</p>
          </div>
        </div>
        <div className="grid gap-4 mt-5">
          <FormField dark label={t('student.fullName')} htmlFor="name" required><Input dark id="name" value={form.name} onChange={set('name')} /></FormField>
          <FormField dark label={t('student.email')} htmlFor="email" hint={t('student.emailLocked')}><Input dark id="email" value={user.email} disabled className="opacity-60 cursor-not-allowed" /></FormField>
          <FormField dark label={t('student.avatarUrl')} htmlFor="avatar" hint={t('student.avatarHint')}><Input dark id="avatar" type="url" placeholder="https://…" value={form.avatar} onChange={set('avatar')} /></FormField>
          <FormField dark label={t('student.phone')} htmlFor="phone"><Input dark id="phone" type="tel" value={form.phone} onChange={set('phone')} /></FormField>
          <FormField dark label={t('student.bio')} htmlFor="bio" hint={`${form.bio.length}/500`}><Textarea dark id="bio" rows={4} maxLength={500} placeholder={t('student.bioPlaceholder')} value={form.bio} onChange={set('bio')} /></FormField>
          <div className="flex justify-end"><Button onClick={save} loading={saving} icon={Save} size="lg">{t('student.saveProfile')}</Button></div>
        </div>
      </div>
    </div>
  );
}
