import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-sm',
  secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-100 bg-white',
  'secondary-dark': 'border border-[#233047] text-slate-200 hover:bg-[#1B2740] bg-transparent',
  ghost: 'text-slate-600 hover:bg-slate-100',
  'ghost-dark': 'text-slate-300 hover:bg-[#1B2740]',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  dangerOutline: 'border border-red-400/50 text-red-400 hover:bg-red-500/10',
};
const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', icon: Icon, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#10B981] ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
