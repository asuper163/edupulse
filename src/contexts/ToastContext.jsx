import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {CheckCircle2, AlertCircle, Info, X, TriangleAlert} from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
};

const accents = {
  success: "border-emerald-500/40 text-emerald-400",
  error: "border-red-500/40 text-red-400",
  info: "border-sky-500/40 text-sky-400",
  warning: "border-amber-500/40 text-amber-400",
};

export function ToastProvider({children}) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const toast = useCallback(
    (type, message) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-2), {id, type, message}]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      success: (m) => toast("success", m),
      error: (m) => toast("error", m),
      info: (m) => toast("info", m),
      warning: (m) => toast("warning", m),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack */}
      <div
        aria-live="polite"
        className="fixed bottom-4 inset-e-4 z-100 flex flex-col gap-2 w-[min(92vw,360px)]"
      >
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-in flex items-start gap-3 rounded-xl border bg-dark-surface/95 backdrop-blur px-4 py-3 shadow-2xl ${accents[t.type] || accents.info}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-slate-100 leading-snug flex-1">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="إغلاق التنبيه"
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
