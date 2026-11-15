import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { DEMO_ACCOUNTS } from '../../data/seed';
import Logo from '../../components/common/Logo';

// Honest, demo-only password recovery — no fake "email sent" claims
export default function ForgotPassword() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Logo />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <KeyRound size={26} className="text-amber-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">{t('auth.forgotTitle')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('auth.forgotSubtitle')}</p>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-xs font-black text-amber-800 uppercase tracking-wider inline-flex items-center gap-1.5"><Info size={13} aria-hidden="true" />{t('auth.forgotHonestTitle')}</p>
            <p className="text-sm text-amber-900 leading-7 mt-1.5">{t('auth.forgotHonestText')}</p>
          </div>

          <p className="text-sm text-slate-600 leading-7 mt-4">{t('auth.forgotResetInfo')}</p>

          <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden text-xs">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.role} className="flex items-center justify-between gap-3 px-4 py-3 bg-[#F8FAFC]">
                <span className="font-bold text-slate-700">{t(`roles.${acc.role}`)}</span>
                <code className="font-mono text-[11px] text-slate-500">{acc.email} · {acc.password}</code>
              </li>
            ))}
          </ul>

          <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800">
            <Arrow size={16} aria-hidden="true" />{t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
