import {useLanguage} from "../../i18n/index.jsx";
import {ChevronLeft, ChevronRight} from "lucide-react";

export function Badge({children, color = "slate", className = ""}) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    red: "bg-red-500/10 text-red-500 border-red-500/30",
    sky: "bg-sky-500/10 text-sky-500 border-sky-500/30",
    slate: "bg-slate-500/10 text-slate-500 border-slate-500/30",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colors[color] || colors.slate} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({status}) {
  const {t} = useLanguage();
  const map = {
    draft: ["slate", t("status.draft")],
    pending: ["amber", t("status.pending")],
    published: ["emerald", t("status.published")],
    rejected: ["red", t("status.rejected")],
    archived: ["slate", t("status.archived")],
    active: ["emerald", t("status.active")],
    suspended: ["red", t("status.suspended")],
    inProgress: ["sky", t("status.inProgress")],
    completed: ["emerald", t("status.completed")],
    notStarted: ["slate", t("status.notStarted")],
    passed: ["emerald", t("status.passed")],
    failed: ["red", t("status.failed")],
    hidden: ["amber", t("status.hidden")],
    visible: ["emerald", t("status.visible")],
    open: ["sky", t("status.open")],
    read: ["slate", t("status.read")],
    archivedMsg: ["slate", t("status.archivedMsg")],
  };
  const [color, label] = map[status] || ["slate", status];
  return <Badge color={color}>{label}</Badge>;
}

export function EmptyState({icon: Icon, title, hint, action, dark = true}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed ${dark ? "border-dark-border text-slate-400" : "border-slate-300 text-slate-500"}`}
    >
      {Icon && (
        <Icon
          size={40}
          strokeWidth={1.5}
          className="mb-3 opacity-60"
          aria-hidden="true"
        />
      )}
      <h3
        className={`font-bold text-base ${dark ? "text-slate-200" : "text-slate-700"}`}
      >
        {title}
      </h3>
      {hint && <p className="text-sm mt-1 max-w-md leading-6">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({size = 22, className = ""}) {
  return (
    <svg
      className={`animate-spin text-[#10B981] ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="جارٍ التحميل"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

export function Pagination({page, totalPages, onChange, dark = true}) {
  const {isRTL} = useLanguage();
  if (totalPages <= 1) return null;
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const btn = `inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${dark ? "border-[#233047] text-slate-300 hover:bg-[#1B2740]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-6"
      aria-label="التنقل بين الصفحات"
    >
      <button
        className={btn}
        disabled={prevDisabled}
        onClick={() => onChange(page - 1)}
        aria-label="الصفحة السابقة"
      >
        <PrevIcon size={16} />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-slate-500">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-[#10B981] text-white" : dark ? "text-slate-300 hover:bg-dark-surface-2" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        className={btn}
        disabled={nextDisabled}
        onClick={() => onChange(page + 1)}
        aria-label="الصفحة التالية"
      >
        <NextIcon size={16} />
      </button>
    </nav>
  );
}

export function ProgressBar({
  value = 0,
  className = "",
  barClass = "bg-[#10B981]",
  trackClass = "bg-slate-200/20",
}) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div
      className={`w-full h-2 rounded-full overflow-hidden ${trackClass} ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClass}`}
        style={{width: `${pct}%`}}
      />
    </div>
  );
}

export function CircularProgress({
  value = 0,
  size = 120,
  stroke = 10,
  dark = true,
}) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={dark ? "#233047" : "#E2E8F0"}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#10B981"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{transition: "stroke-dashoffset .6s ease"}}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill={dark ? "#F1F5F9" : "#0F172A"}
        fontSize={size * 0.2}
        fontWeight="700"
        className="tnum"
      >
        {pct}%
      </text>
    </svg>
  );
}

export function Tabs({tabs, active, onChange, dark = true, className = ""}) {
  return (
    <div
      className={`flex flex-wrap gap-1.5 rounded-2xl border p-1.5 w-fit max-w-full ${
        dark
          ? "bg-[#151F32] border-[#1c2941]"
          : "bg-slate-100 border-slate-200"
      } ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[12px] font-black transition-all focus-visible:outline-2 focus-visible:outline-[#10B981] ${
              isActive
                ? "bg-[#10B981] text-white shadow-[0_6px_18px_rgb(16_185_129/0.35)]"
                : dark
                  ? "text-slate-400 hover:text-slate-100 hover:bg-[#1B2740]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-[10px] font-black tnum ${
                  isActive
                    ? "bg-black/25 text-white"
                    : dark
                      ? "bg-[#0B1120] text-emerald-400"
                      : "bg-white text-emerald-700 border border-emerald-200"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
