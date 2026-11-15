import { useState } from 'react';
import { FileText, Download, Users, BookOpen, ClipboardList, CheckCircle2, ListChecks, Star, Award, Eye, Banknote, Wallet } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { reportService } from '../../services/reportService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function Reports() {
  const { t } = useLanguage();
  const toast = useToast();
  const [activeType, setActiveType] = useState(null);
  const [rows, setRows] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const reports = [
    { type: 'users', icon: Users, label: t('admin.reportUsers') },
    { type: 'courses', icon: BookOpen, label: t('admin.reportCourses') },
    { type: 'enrollments', icon: ClipboardList, label: t('admin.reportEnrollments') },
    { type: 'completions', icon: CheckCircle2, label: t('admin.reportCompletions') },
    { type: 'quizzes', icon: ListChecks, label: t('admin.reportQuizzes') },
    { type: 'instructors', icon: Award, label: t('admin.reportInstructors') },
    { type: 'reviews', icon: Star, label: t('admin.reportReviews') },
    { type: 'sales', icon: Banknote, label: t('admin.reportSales') },
    { type: 'payments', icon: Wallet, label: t('admin.reportPayments') },
  ];

  const generate = (type) => {
    const data = reportService.build(type);
    setActiveType(type);
    setRows(data);
    setPreviewOpen(true);
    if (!data.length) toast.info(t('admin.noReportData'));
  };
  const exportActive = () => {
    if (!activeType) return;
    if (reportService.downloadCsv(activeType)) toast.success(t('admin.reportGenerated'));
    else toast.info(t('admin.noReportData'));
  };

  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div>
      <PageHeader title={t('admin.reportsTitle')} subtitle={t('admin.reportsSubtitle')} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map(({ type, icon: Icon, label }) => (
          <button key={type} onClick={() => generate(type)} className="group rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 text-start hover:border-emerald-500/40 hover:bg-[#182238] transition-all">
            <span className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Icon size={22} className="text-emerald-400" aria-hidden="true" /></span>
            <span className="text-sm font-bold text-slate-100 block">{label}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 group-hover:text-emerald-400 transition-colors"><Eye size={12} aria-hidden="true" />{t('admin.generateReport')}</span>
          </button>
        ))}
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={reports.find((r) => r.type === activeType)?.label} size="xl">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">{t('admin.noReportData')}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-slate-500 tnum">{rows.length} {t('common.results')}</p>
              <Button size="sm" icon={Download} onClick={exportActive}>{t('admin.exportCsv')}</Button>
            </div>
            <div className="overflow-auto max-h-[60vh] rounded-xl border border-[#1c2941]">
              <table className="w-full text-[11px] table-auto">
                <thead className="bg-[#111a2e] sticky top-0"><tr>{columns.map((c) => <th key={c} className="text-start px-3 py-2 font-bold text-slate-400 whitespace-nowrap">{c}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">{rows.slice(0, 100).map((row, i) => <tr key={i}>{columns.map((c) => <td key={c} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-64 truncate">{String(row[c] ?? '')}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
