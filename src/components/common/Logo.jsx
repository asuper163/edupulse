import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/index.jsx';

export default function Logo({ dark = false, className = '' }) {
  const { t } = useLanguage();
  return (
    <Link to="/" aria-label="الصفحة الرئيسية - EDUPULSE" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <span className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center shadow-[0_0_18px_rgb(16_185_129/0.45)] group-hover:scale-105 transition-transform">
        <Activity size={20} strokeWidth={2.5} className="text-[#0B1120]" aria-hidden="true" />
      </span>
      <span className={`text-[1.35rem] font-black tracking-tight leading-none ${dark ? 'text-slate-50' : 'text-slate-900'}`}>
        EDU<span className="text-[#10B981]">PULSE</span>
        <span className={`block text-[9px] font-semibold tracking-[0.18em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{t('common.tagline')}</span>
      </span>
    </Link>
  );
}
