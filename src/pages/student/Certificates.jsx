import {useMemo, useState} from "react";
import {Award, Printer, X, Activity} from "lucide-react";
import {useLanguage} from "../../i18n/index.jsx";
import {useAuth} from "../../contexts/AuthContext";
import {certificateService} from "../../services/certificateService";
import {courseService} from "../../services/courseService";
import {userService} from "../../services/userService";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import {EmptyState} from "../../components/common/Feedback";
import {formatDate} from "../../utils/format";
import {localized} from "../../utils/localized";

export default function Certificates() {
  const {t, lang, locale} = useLanguage();
  const {user} = useAuth();
  const [printing, setPrinting] = useState(null);

  const certificates = useMemo(
    () =>
      certificateService.getByStudent(user.id).map((c) => ({
        ...c,
        course: courseService.getById(c.courseId),
        instructor: userService.getById(c.instructorId),
      })),
    [user.id],
  );

  const printCert = printing
    ? certificates.find((c) => c.id === printing)
    : null;

  return (
    <div>
      <PageHeader
        title={t("student.certificatesTitle")}
        subtitle={t("student.certificatesSubtitle")}
      />
      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title={t("student.certificatesEmpty")}
          hint={t("student.certificatesEmptyHint")}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5 print:hidden">
          {certificates.map((cert) => (
            <article
              key={cert.id}
              className="relative rounded-3xl border border-amber-500/25 bg-linear-to-br from-[#1a2332] via-dark-surface to-[#0f1a2e] p-6 overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="absolute -top-10 -inset-e-10 w-40 h-40 rounded-full border-8 border-amber-500/10"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-12 -inset-s-12 w-44 h-44 rounded-full border-8 border-emerald-500/10"
              />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-amber-500 font-black tracking-widest text-xs">
                  <Award size={16} aria-hidden="true" />
                  EDUPULSE
                </span>
                <span className="text-[10px] text-slate-500 font-mono tnum">
                  {cert.certificateNumber}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-100 leading-snug mt-4">
                {localized(cert.course?.title, lang)}
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                {cert.instructor?.name}
              </p>
              <div className="flex items-center justify-between mt-5">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {t("student.issuedOn")}
                  </p>
                  <p className="text-xs font-bold text-slate-200">
                    {formatDate(cert.issuedAt, locale)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary-dark"
                  onClick={() => setPrinting(cert.id)}
                  icon={Printer}
                >
                  {t("student.printCertificate")}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Printable certificate (print-only via CSS) */}
      {printCert && (
        <div className="fixed inset-0 z-90 bg-black/70 backdrop-blur-sm overflow-auto print:static print:bg-white">
          <button
            onClick={() => setPrinting(null)}
            aria-label={t("common.close")}
            className="absolute top-4 inset-e-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 print:hidden"
          >
            <X size={22} />
          </button>
          <button
            onClick={() => window.print()}
            className="fixed bottom-6 inset-e-6 inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-emerald-500 text-dark-bg font-black shadow-2xl print:hidden"
          >
            <Printer size={18} aria-hidden="true" />
            {t("common.print")}
          </button>
          <div className="min-h-full flex items-center justify-center p-6 print:p-0 print:min-h-0">
            <div
              className="certificate-print relative w-262.5 max-w-full aspect-[1.414/1] bg-[#FDFBF7] text-[#1a2332] rounded-lg shadow-2xl overflow-hidden print:rounded-none"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {/* Ornamental frame */}
              <div className="absolute inset-3 border-[3px] border-[#C9A227] rounded-md" />
              <div className="absolute inset-5 border border-[#10B981]/60 rounded-sm" />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-16 py-10">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-dark-bg flex items-center justify-center">
                    <Activity
                      size={24}
                      className="text-[#10B981]"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-2xl font-black tracking-[0.22em]">
                    EDU<span className="text-[#10B981]">PULSE</span>
                  </span>
                </div>
                <p className="text-[#8a6d1c] text-[11px] font-bold uppercase tracking-[0.35em] mt-3">
                  {lang === "ar"
                    ? "شهادة إتمام دورة"
                    : "Certificate of Completion"}
                </p>
                <p className="text-xs text-slate-500 mt-4 italic">
                  {t("student.certificateText")}
                </p>
                <h1
                  className="text-4xl font-black mt-2"
                  style={{
                    fontFamily:
                      lang === "ar" ? "Cairo, sans-serif" : "Georgia, serif",
                  }}
                >
                  {user.name}
                </h1>
                <div className="w-64 h-px bg-[#C9A227] my-3" />
                <p className="text-xs text-slate-500">
                  {t("student.certificateCompleted")}
                </p>
                <h2 className="text-2xl font-bold text-emerald-800 mt-1">
                  {localized(printCert.course?.title, lang)}
                </h2>
                <div className="flex items-end justify-between w-full mt-8 px-6">
                  <div className="text-start">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">
                      {lang === "ar" ? "المدرب" : "Instructor"}
                    </p>
                    <p className="text-sm font-bold border-t border-slate-300 pt-1 min-w-40">
                      {printCert.instructor?.name || "—"}
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    className="w-20 h-20 rounded-full border-4 border-emerald-600/60 flex flex-col items-center justify-center rotate-[-8deg]"
                  >
                    <Award size={26} className="text-emerald-700" />
                    <span className="text-[8px] font-black text-emerald-800 tracking-widest mt-0.5">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-end">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">
                      {t("student.issuedOn")}
                    </p>
                    <p className="text-sm font-bold border-t border-slate-300 pt-1">
                      {formatDate(printCert.issuedAt, locale)}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-4 tracking-wider">
                  {t("student.certificateNo")}: {printCert.certificateNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
