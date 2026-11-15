import { useEffect, useRef, useState } from 'react';

export default function Dropdown({ trigger, items, dark = true, align = 'end', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex items-center">
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-52 rounded-xl border shadow-2xl overflow-hidden py-1 ${align === 'end' ? 'end-0' : 'start-0'} ${
            dark ? 'bg-[#1B2740] border-[#2c3a55] text-slate-200' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          {items.filter(Boolean).map((item, i) =>
            item.divider ? (
              <div key={`d${i}`} className={`my-1 border-t ${dark ? 'border-[#2c3a55]' : 'border-slate-100'}`} />
            ) : (
              <button
                key={i}
                role="menuitem"
                onClick={() => { setOpen(false); item.onClick?.(); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-start transition-colors ${item.danger ? 'text-red-400' : ''} ${dark ? 'hover:bg-[#233047]' : 'hover:bg-slate-50'}`}
              >
                {item.icon && <item.icon size={16} aria-hidden="true" />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
