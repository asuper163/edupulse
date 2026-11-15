import { forwardRef } from 'react';

const baseLight = 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:border-[#10B981]';
const baseDark = 'bg-[#0B1120] border-[#233047] text-slate-100 placeholder-slate-500 hover:border-[#31435f] focus:border-[#10B981]';

export const Input = forwardRef(function Input({ dark = false, icon: Icon, className = '', invalid = false, ...props }, ref) {
  return (
    <div className="relative w-full">
      {Icon && <Icon size={16} aria-hidden="true" className={`absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none ${dark ? 'text-slate-500' : 'text-slate-400'}`} />}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`w-full h-10 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#10B981]/30 pe-3 ${Icon ? 'ps-9' : 'ps-3'} ${dark ? baseDark : baseLight} ${invalid ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ dark = false, className = '', invalid = false, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={`w-full rounded-xl border text-sm px-3 py-2 transition-colors outline-none focus:ring-2 focus:ring-[#10B981]/30 ${dark ? baseDark : baseLight} ${invalid ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ dark = false, className = '', invalid = false, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`w-full h-10 rounded-xl border text-sm px-3 pe-8 appearance-none bg-no-repeat transition-colors outline-none focus:ring-2 focus:ring-[#10B981]/30 ${dark ? baseDark : baseLight} ${invalid ? 'border-red-400' : ''} ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'left 0.6rem center' }}
      {...props}
    >
      {children}
    </select>
  );
});

export function FormField({ label, htmlFor, required = false, error, hint, children, dark = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className={`text-xs font-semibold tracking-wide ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          {label}
          {required && <span className="text-red-400 ms-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p role="alert" className="text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}
