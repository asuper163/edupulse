import {Link} from "react-router-dom";
import {Activity, Home} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";

export default function NotFound() {
  const {t} = useLanguage();
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center px-6">
      <Activity
        size={40}
        className="text-emerald-400 mb-6"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-7xl font-black text-slate-800 select-none">404</p>
      <h1 className="text-xl font-black text-slate-100 mt-4">
        {t("notFound.title")}
      </h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-6">
        {t("notFound.text")}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-[#0B1120] font-black transition-colors"
      >
        <Home size={18} aria-hidden="true" />
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
