import {
  Target,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Users,
  Rocket,
  Activity,
} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import Logo from "../../components/common/Logo";

export default function About() {
  const {t} = useLanguage();
  return (
    <div>
      <section className="bg-dark-bg text-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-5">
            <Logo dark />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">
            {t("about.title")}
          </h1>
          <p className="text-emerald-400 font-bold mt-2">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
            <Target size={24} className="text-emerald-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t("about.missionTitle")}
          </h2>
          <p className="text-slate-600 leading-8 mt-2">
            {t("about.missionText")}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
            <Eye size={24} className="text-teal-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t("about.visionTitle")}
          </h2>
          <p className="text-slate-600 leading-8 mt-2">
            {t("about.visionText")}
          </p>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl font-black text-slate-900 text-center">
            {t("about.valuesTitle")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5 mt-8">
            {[
              {
                icon: ShieldCheck,
                title: t("about.value1Title"),
                text: t("about.value1Text"),
              },
              {
                icon: HeartHandshake,
                title: t("about.value2Title"),
                text: t("about.value2Text"),
              },
              {
                icon: Rocket,
                title: t("about.value3Title"),
                text: t("about.value3Text"),
              },
            ].map(({icon: Icon, title, text}, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 p-6 text-center"
              >
                <Icon
                  size={26}
                  className="text-emerald-600 mx-auto mb-3"
                  aria-hidden="true"
                />
                <h3 className="font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
        <h2 className="text-2xl font-black text-slate-900">
          {t("about.storyTitle")}
        </h2>
        <p className="text-slate-600 leading-9 mt-4">{t("about.storyText")}</p>
        <p className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mt-6">
          <Activity size={14} aria-hidden="true" />
          {t("about.stackText")}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <h2 className="text-2xl font-black text-slate-900">
          {t("about.teamTitle")}
        </h2>
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {["EDUPULSE Product", "EDUPULSE Engineering", "EDUPULSE Content"].map(
            (n, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 flex items-center gap-3"
              >
                <Users
                  size={20}
                  className="text-emerald-600"
                  aria-hidden="true"
                />
                <span className="text-sm font-bold text-slate-700">{n}</span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
