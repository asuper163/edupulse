import { useMemo, useRef, useState } from 'react';
import { Download, Upload, RotateCcw, ShieldCheck, Info, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { storageAdapter } from '../../storage/storageAdapter';
import { resetDemoData } from '../../storage/storageInitializer';
import { SCHEMA_VERSION, STORAGE_KEYS } from '../../storage/storageKeys';
import { formatNumber } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function DataManagement() {
  const { t, locale } = useLanguage();
  const toast = useToast();
  const fileRef = useRef(null);
  const [importResult, setImportResult] = useState(null); // { payload, counts, error }
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState('');
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  const stats = useMemo(() => {
    const users = storageAdapter.getCollection('users');
    const courses = storageAdapter.getCollection('courses');
    const enrollments = storageAdapter.getCollection('enrollments');
    return {
      users: users.length,
      courses: courses.length,
      enrollments: enrollments.length,
      bytes: storageAdapter.approxUsageBytes(),
      schema: storageAdapter.get(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION),
    };
  }, [tick]);

  const doExport = () => {
    const backup = storageAdapter.exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupulse-backup-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('admin.exportDone'));
  };

  const onFileChosen = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        const check = storageAdapter.validateBackup(payload);
        if (!check.valid) {
          setImportResult({ payload: null, error: check.reason === 'schema_mismatch' ? t('admin.importSchemaMismatch') : t('admin.importInvalid', { reason: check.reason }) });
        } else {
          setImportResult({ payload, counts: payload.counts || {}, error: null });
        }
      } catch {
        setImportResult({ payload: null, error: t('admin.importInvalid', { reason: 'JSON parse' }) });
      } finally {
        setBusy(false);
      }
    };
    reader.onerror = () => { setImportResult({ payload: null, error: t('admin.importInvalid', { reason: 'file read' }) }); setBusy(false); };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const res = storageAdapter.importBackup(importResult.payload);
    if (res.ok) {
      toast.success(t('admin.importSuccess'));
      setImportResult(null);
      setTick((v) => v + 1);
      window.setTimeout(() => window.location.reload(), 900);
    } else {
      toast.error(t('admin.importInvalid', { reason: res.reason }));
      setImportResult(null); // validation already guaranteed safe — current data untouched
    }
  };

  const doReset = () => {
    if (resetText.trim().toUpperCase() !== 'RESET') return;
    setBusy(true);
    resetDemoData();
    setBusy(false);
    setResetOpen(false);
    setResetText('');
    toast.success(t('admin.resetDone'));
    setTick((v) => v + 1);
    window.setTimeout(() => window.location.reload(), 900);
  };

  const counter = (n) => formatNumber(n, locale);
  const usage = stats.bytes < 1024 * 1024 ? `${(stats.bytes / 1024).toFixed(1)} KB` : `${(stats.bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('admin.dataManagementTitle')} subtitle={t('admin.dataManagementSubtitle')} />

      {/* Storage usage strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('admin.kpiUsers'), value: counter(stats.users) },
          { label: t('admin.kpiCourses'), value: counter(stats.courses) },
          { label: t('admin.kpiEnrollments'), value: counter(stats.enrollments) },
          { label: t('admin.storageUsage'), value: usage },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl border border-[#1c2941] bg-[#151F32] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p><p className="text-lg font-black text-slate-100 tnum mt-0.5">{item.value}</p></div>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 mb-6 -mt-3 tnum">{t('admin.schemaVersion')}: v{stats.schema}</p>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Export card */}
        <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 flex flex-col">
          <span className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3"><Download size={22} className="text-emerald-400" aria-hidden="true" /></span>
          <h2 className="font-black text-slate-100">{t('admin.exportTitle')}</h2>
          <p className="text-[11px] text-slate-400 leading-5 mt-1.5 flex-1">{t('admin.exportText')}</p>
          <p className="text-[10px] text-emerald-500/80 font-bold mt-2 tnum">{t('admin.exportCounters', { users: stats.users, courses: stats.courses, enrollments: stats.enrollments })}</p>
          <Button className="mt-4" icon={FileJson} onClick={doExport}>{t('admin.exportButton')}</Button>
        </section>

        {/* Import card */}
        <section className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-6 flex flex-col">
          <span className="w-12 h-12 rounded-xl bg-sky-500/15 flex items-center justify-center mb-3"><Upload size={22} className="text-sky-400" aria-hidden="true" /></span>
          <h2 className="font-black text-slate-100">{t('admin.importTitle')}</h2>
          <p className="text-[11px] text-slate-400 leading-5 mt-1.5 flex-1">{t('admin.importText')}</p>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFileChosen} aria-hidden="true" tabIndex={-1} />
          <Button className="mt-4" variant="secondary-dark" loading={busy} icon={Upload} onClick={() => fileRef.current?.click()}>{t('admin.importChoose')}</Button>
        </section>
      </div>

      {/* Reset card */}
      <section className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6 mt-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <span className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0"><RotateCcw size={22} className="text-red-400" aria-hidden="true" /></span>
        <div className="flex-1">
          <h2 className="font-black text-slate-100">{t('admin.resetTitle')}</h2>
          <p className="text-[11px] text-slate-400 leading-5 mt-1">{t('admin.resetText')}</p>
        </div>
        <Button variant="danger" className="shrink-0" icon={RotateCcw} onClick={() => setResetOpen(true)}>{t('admin.resetButton')}</Button>
      </section>

      {/* Honest limits */}
      <section className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 mt-5 flex items-start gap-3">
        <Info size={18} className="text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-xs font-bold text-slate-200">{t('admin.storageLimitsTitle')}</h3>
          <p className="text-[11px] text-slate-500 leading-6 mt-1">{t('admin.storageLimitsText')}</p>
        </div>
      </section>

      {/* Import preview / error modal */}
      <Modal open={!!importResult} onClose={() => setImportResult(null)} title={importResult?.error ? t('common.error') : t('admin.importPreview')}>
        {importResult?.error ? (
          <div className="flex items-start gap-3"><AlertTriangle size={22} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" /><p className="text-sm text-slate-200 leading-7">{importResult.error}</p></div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm"><CheckCircle2 size={18} aria-hidden="true" />EDUPULSE backup · v{importResult?.payload?.schemaVersion}</div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[11px] text-slate-300">
              {importResult?.counts && Object.entries(importResult.counts).map(([key, value]) => <li key={key} className="rounded-lg border border-[#1c2941] px-3 py-2 tnum">{key}: <b>{value}</b></li>)}
            </ul>
            <p className="text-[11px] text-amber-400/90 font-semibold mt-3">{t('admin.importConfirm')}</p>
            <div className="flex justify-end gap-2 mt-4"><Button variant="secondary-dark" onClick={() => setImportResult(null)}>{t('common.cancel')}</Button><Button variant="danger" icon={ShieldCheck} onClick={confirmImport}>{t('common.confirm')}</Button></div>
          </>
        )}
      </Modal>

      {/* Typed-confirmation reset modal */}
      <Modal open={resetOpen} onClose={() => { setResetOpen(false); setResetText(''); }} title={t('admin.resetConfirmTitle')}>
        <div className="flex items-start gap-3"><AlertTriangle size={22} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" /><p className="text-xs text-slate-300 leading-6">{t('admin.resetConfirmText')}</p></div>
        <input autoFocus value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder={t('admin.resetConfirmWord')} dir="ltr" className="mt-4 w-full h-11 rounded-xl border border-red-500/40 bg-[#0B1120] text-red-300 px-4 font-black tracking-[0.3em] text-center outline-none focus:border-red-400" aria-label={t('admin.resetConfirmWord')} />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary-dark" onClick={() => { setResetOpen(false); setResetText(''); }}>{t('common.cancel')}</Button>
          <Button variant="danger" icon={RotateCcw} loading={busy} disabled={resetText.trim().toUpperCase() !== 'RESET'} onClick={doReset}>{t('admin.resetButton')}</Button>
        </div>
      </Modal>
    </div>
  );
}
