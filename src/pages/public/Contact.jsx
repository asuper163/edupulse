import { useState } from 'react';
import { Mail, Send, CheckCircle2, Clock3, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { storageAdapter } from '../../storage/storageAdapter';
import { uid } from '../../utils/format';
import Button from '../../components/common/Button';
import { Input, Textarea, FormField } from '../../components/common/FormControls';

export default function Contact() {
  const { t } = useLanguage();
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, t('validation.minLength', { min: 2 })),
    email: z.string().trim().email(t('validation.invalidEmail')),
    subject: z.string().trim().min(3, t('validation.minLength', { min: 3 })),
    message: z.string().trim().min(10, t('validation.minLength', { min: 10 })),
  });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (values) => {
    try {
      storageAdapter.insertInCollection('messages', { id: uid('msg'), ...values, status: 'open', createdAt: new Date().toISOString() });
      setSent(true);
      toast.success(t('contact.successTitle'));
      reset();
    } catch {
      toast.error(t('contact.errorText'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid lg:grid-cols-5 gap-10">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-black text-slate-900">{t('contact.title')}</h1>
        <p className="text-slate-500 mt-2 leading-7">{t('contact.subtitle')}</p>
        <div className="mt-8 space-y-5">
          <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><Mail size={20} className="text-emerald-600" aria-hidden="true" /></div><div><p className="text-xs font-bold text-slate-800">{t('contact.emailUs')}</p><p className="text-sm text-slate-600 font-mono">{t('contact.emailValue')}</p></div></div>
          <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0"><Clock3 size={20} className="text-teal-600" aria-hidden="true" /></div><div><p className="text-xs font-bold text-slate-800">{t('contact.responseTime')}</p><p className="text-sm text-slate-600">{t('contact.responseTimeValue')}</p></div></div>
          <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><MessageSquare size={20} className="text-emerald-600" aria-hidden="true" /></div><div><p className="text-xs font-bold text-slate-800">{t('contact.officeTitle')}</p><p className="text-sm text-slate-600">{t('contact.officeText')}</p></div></div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {sent ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center h-full flex flex-col items-center justify-center">
            <CheckCircle2 size={56} className="text-emerald-500" aria-hidden="true" />
            <h2 className="text-2xl font-black text-emerald-800 mt-4">{t('contact.successTitle')}</h2>
            <p className="text-emerald-700 mt-1">{t('contact.successText')}</p>
            <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>{t('common.send')} {'→'}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={t('contact.name')} htmlFor="c-name" required error={errors.name?.message}>
                <Input id="c-name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
              </FormField>
              <FormField label={t('contact.email')} htmlFor="c-email" required error={errors.email?.message}>
                <Input id="c-email" type="email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
              </FormField>
            </div>
            <FormField label={t('contact.subject')} htmlFor="c-subject" required error={errors.subject?.message}>
              <Input id="c-subject" invalid={!!errors.subject} {...register('subject')} />
            </FormField>
            <FormField label={t('contact.message')} htmlFor="c-message" required error={errors.message?.message}>
              <Textarea id="c-message" rows={6} invalid={!!errors.message} {...register('message')} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" size="lg" loading={isSubmitting} icon={Send}>{isSubmitting ? t('contact.sending') : t('contact.send')}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
