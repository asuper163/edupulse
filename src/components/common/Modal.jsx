import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md', dark = true, labelledBy }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the first editable control inside the body (not the header's close button),
    // and only once per open — never on re-renders from typing.
    const focusTarget =
      panelRef.current?.querySelector('input, select, textarea, [tabindex]:not([tabindex="-1"])') ||
      panelRef.current?.querySelector('button');
    focusTarget?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={labelledBy || 'modal-title'}>
      <button aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-default" />
      <div
        ref={panelRef}
        className={`modal-in relative w-full ${sizes[size]} max-h-[92vh] overflow-y-auto dark-scroll rounded-t-2xl sm:rounded-2xl border shadow-2xl ${
          dark ? 'bg-[#151F32] border-[#233047] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b backdrop-blur ${dark ? 'bg-[#151F32]/95 border-[#233047]' : 'bg-white/95 border-slate-200'} rounded-t-2xl`}>
          <h2 id="modal-title" className="text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-[#1B2740]' : 'text-slate-500 hover:bg-slate-100'}`}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
