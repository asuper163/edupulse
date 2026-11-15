import {useMemo, useState} from "react";
import {Bell, CheckCheck, Trash2, BellOff} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {notificationService} from "../../services/notificationService";
import {timeAgo} from "../../utils/format";
import {localized} from "../../utils/localized";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import {EmptyState} from "../../components/common/Feedback";

// Shared notification inbox for student & instructor dashboards (set hideHeader to embed)
export default function NotificationsList({hideHeader = false}) {
  const {t, lang, locale} = useLanguage();
  const {user} = useAuth();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const notifications = useMemo(
    () => notificationService.getForUser(user.id),
    [user.id, tick],
  );
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl">
      {!hideHeader && (
        <PageHeader
          title={t("student.notificationsTitle")}
          subtitle={
            unread > 0
              ? `${unread} ${t("status.unread")}`
              : t("student.allCaughtUp")
          }
          actions={
            unread > 0 && (
              <Button
                size="sm"
                variant="secondary-dark"
                icon={CheckCheck}
                onClick={() => {
                  notificationService.markAllRead(user.id);
                  refresh();
                }}
              >
                {t("student.markAllRead")}
              </Button>
            )
          }
        />
      )}
      {notifications.length === 0 ? (
        <EmptyState icon={BellOff} title={t("student.allCaughtUp")} />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${n.isRead ? "border-[#1c2941] bg-dark-surface" : "border-emerald-500/30 bg-emerald-500/5"}`}
            >
              <span
                className={`mt-1 p-2 rounded-xl shrink-0 ${n.isRead ? "bg-dark-surface-2 text-slate-500" : "bg-emerald-500/15 text-emerald-400"}`}
              >
                <Bell size={16} aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-100">
                  {localized(n.title, lang)}
                  {!n.isRead && (
                    <span
                      className="ms-2 inline-block w-2 h-2 rounded-full bg-emerald-400 align-middle"
                      aria-label={t("status.unread")}
                    />
                  )}
                </p>
                <p className="text-[11px] text-slate-400 leading-5 mt-1">
                  {localized(n.message, lang)}
                </p>
                <p className="text-[10px] text-slate-600 mt-1.5">
                  {timeAgo(n.createdAt, locale)}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => {
                      notificationService.markRead(n.id);
                      refresh();
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    aria-label={t("student.markRead")}
                  >
                    <CheckCheck size={15} aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={() => {
                    notificationService.remove(n.id);
                    refresh();
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label={t("student.deleteNotification")}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
