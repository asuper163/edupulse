import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, GraduationCap, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import dashboardPath from '../../utils/dashboardPath';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/common/Button';
import { Input, Select, FormField } from '../../components/common/FormControls';
import Logo from '../../components/common/Logo';

export default function Register() {
  const { t } = useLanguage();
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const schema = z.object({
    name: z.string().trim().min(3, t('validation.minLength', { min: 3 })),
    email: z.string().trim().email(t('validation.invalidEmail')),
    password: z.string().min(6, t('validation.minLength', { min: 6 })),
    confirmPassword: z.string(),
    role: z.enum(['student', 'instructor'], { required_error: t('validation.selectRequired') }),
  }).refine((v) => v.password === v.confirmPassword, { message: t('validation.passwordMismatch'), path: ['confirmPassword'] });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'student' } });
  const role = watch('role');

  const onSubmit = (values) => {
    setFormError('');
    const res = registerUser(values);
    if (!res.ok) {
      setFormError(res.error === 'email_exists' ? t('auth.emailExists') : t('errors.generic'));
      return;
    }
    toast.success(t('auth.registerSuccess'));
    navigate(dashboardPath(res.user.role), { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC] px-4 sm:px-8 py-10">
      <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-black text-slate-900">{t('auth.registerTitle')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('auth.registerSubtitle')}</p>

          {formError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3">{formError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 grid gap-4">
            <FormField label={t('auth.fullName')} htmlFor="name" required error={errors.name?.message}>
              <Input id="name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
            </FormField>
            <FormField label={t('auth.email')} htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="name@example.com" invalid={!!errors.email} {...register('email')} />
            </FormField>
            <FormField label={t('auth.accountType')} htmlFor="role" required error={errors.role?.message}>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('auth.accountType')}>
                {[
                  { value: 'student', label: t('auth.studentType'), icon: UserRound },
                  { value: 'instructor', label: t('auth.instructorType'), icon: GraduationCap },
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 cursor-pointer transition-all text-xs font-semibold ${role === value ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <input type="radio" value={value} {...register('role')} className="sr-only" />
                    <Icon size={18} className="shrink-0" aria-hidden="true" />
                    <span className="leading-snug">{label}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 inline-flex items-center gap-1"><ShieldCheck size={11} aria-hidden="true" />{t('auth.noAdminType')}</p>
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={t('auth.password')} htmlFor="password" required error={errors.password?.message}>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" invalid={!!errors.password} style={{ paddingInlineEnd: '2.75rem' }} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormField>
              <FormField label={t('auth.confirmPassword')} htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
                <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
              </FormField>
            </div>
            <Button type="submit" size="lg" loading={isSubmitting} icon={UserPlus} className="w-full">{t('auth.signUp')}</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">{t('auth.haveAccount')} <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">{t('nav.login')}</Link></p>
      </div>
    </div>
  );
}
