import {useEffect, useState} from "react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {useToast} from "../../contexts/ToastContext";
import {storageAdapter} from "../../storage/storageAdapter";
import PageHeader from "../../components/common/PageHeader";
import {uid} from "../../utils/format";

export default function StudentSettings() {
  const {t} = useLanguage();
  const {user} = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = useState(() => {
    const existing = storageAdapter
      .getCollection("settings")
      .find((s) => s.userId === user.id);
    return (
      existing?.notificationPreferences || {
        course: true,
        quiz: true,
        certificate: true,
        announcements: true,
      }
    );
  });

  const toggle = (key) => {
    const next = {...prefs, [key]: !prefs[key]};
    setPrefs(next);
    const all = storageAdapter.getCollection("settings");
    const existing = all.find((s) => s.userId === user.id);
    if (existing) {
      storageAdapter.setCollection(
        "settings",
        all.map((s) =>
          s.userId === user.id
            ? {
                ...s,
                notificationPreferences: next,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    } else {
      storageAdapter.insertInCollection("settings", {
        id: uid("set"),
        userId: user.id,
        language: "ar",
        notificationPreferences: next,
        preferences: {},
        updatedAt: new Date().toISOString(),
      });
    }
    toast.success(t("student.notifSaved"));
  };

  const notifRows = [
    {key: "course", label: t("student.notifCourse")},
    {key: "quiz", label: t("student.notifQuiz")},
    {key: "certificate", label: t("student.notifCertificate")},
    {key: "announcements", label: t("student.notifAnnouncements")},
  ];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={t("student.settingsTitle")}
        subtitle={t("student.settingsSubtitle")}
      />

      {/* Notification preferences */}
      <section className="rounded-2xl border border-[#1c2941] bg-dark-surface p-5 sm:p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("student.notifPrefs")}
        </h2>
        <ul className="mt-3 divide-y divide-[#1c2941]">
          {notifRows.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <span className="text-sm text-slate-200">{row.label}</span>
              <button
                role="switch"
                aria-checked={!!prefs[row.key]}
                aria-label={row.label}
                onClick={() => toggle(row.key)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs[row.key] ? "bg-[#10B981]" : "bg-dark-border"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${prefs[row.key] ? "inset-s-5.5" : "inset-s-0.5"}`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] text-slate-600 mt-5 leading-5">
        {t("student.clearLocalDataHint")}
      </p>
    </div>
  );
}
