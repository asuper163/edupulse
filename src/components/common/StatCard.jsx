export default function StatCard({ icon: Icon, label, value, suffix = '', tone = 'emerald', hint }) {
  const tones = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    sky: 'text-sky-400 bg-sky-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    violet: 'text-violet-400 bg-violet-500/10',
    red: 'text-red-400 bg-red-500/10',
  };
  return (
    <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
        {Icon && <span className={`p-2 rounded-xl ${tones[tone] || tones.emerald}`}><Icon size={18} aria-hidden="true" /></span>}
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 tnum leading-none">{value}<span className="text-sm text-slate-500 font-bold ms-1">{suffix}</span></p>
      {hint && <p className="text-[10px] text-slate-600 mt-1.5">{hint}</p>}
    </div>
  );
}
