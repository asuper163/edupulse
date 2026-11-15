import { useState } from 'react';
import { Save, ShieldCheck, Megaphone } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { storageAdapter } from '../../storage/storageAdapter';
import { EXTRA_KEYS } from '../../storage/storageKeys';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Input, FormField } from '../../components/common/FormControls';

// Local, device-scoped platform settings (demo scope — not a real global config)
export default function AdminSettings() {
  const { t } = useLanguage();
  const toast = useToast();
  const [platformName, setPlatformName] = useState(() => storageAdapter.get(EXTRA_KEYS.siteName, 'EDUPULSE'));
  const [showDemoBanner, setShowDemoBanner] = useState(() => storageAdapter.get(EXTRA_KEYS.demoBanner, true));
  const [maintenance, setMaintenance] = useState(() => storageAdapter.get(EXTRA_KEYS.maintenance, false));

  const save = () => {
    storageAdapter.set(EXTRA_KEYS.siteName, platformName);
    storageAdapter.set(EXTRA_KEYS.demoBanner, showDemoBanner);
    storageAdapter.set(EXTRA_KEYS.maintenance, maintenance);
    toast.success(t('admin.settingsSaved'));
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title={t('admin.settingsTitle')} subtitle={t('admin.settingsSubtitle')} />
      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 sm:p-6 grid gap-5">
        <FormField dark label={t('admin.platformName')} htmlFor="pname"><Input dark id="pname" value={platformName} onChange={(e) => setPlatformName(e.target.value)} /></FormField>

        <div className="flex items-center gap-3 rounded-xl border border-[#1c2941] px-4 py-3">
          <span className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black">ع</span>
          <span><span className="block text-xs font-bold text-slate-100">{t('admin.defaultLanguage')}: {t('common.arabic')}</span><span className="block text-[10px] text-slate-500 mt-0.5">{t('student.languagePrefHint')}</span></span>
        </div>

        <label className="flex items-start justify-between gap-4 rounded-xl border border-[#1c2941] p-4 cursor-pointer">
          <span className="flex items-start gap-3"><Megaphone size={18} className="text-amber-400 mt-0.5" aria-hidden="true" /><span><span className="block text-xs font-bold text-slate-100">{t('admin.showDemoBanner')}</span><span className="block text-[10px] text-slate-500 mt-1">{t('footer.demoNote')}</span></span></span>
          <input type="checkbox" className="accent-emerald-500 w-5 h-5 mt-1" checked={showDemoBanner} onChange={(e) => setShowDemoBanner(e.target.checked)} />
        </label>

        <label className="flex items-start justify-between gap-4 rounded-xl border border-[#1c2941] p-4 cursor-pointer">
          <span className="flex items-start gap-3"><ShieldCheck size={18} className="text-sky-400 mt-0.5" aria-hidden="true" /><span><span className="block text-xs font-bold text-slate-100">{t('admin.maintenanceMode')}</span><span className="block text-[10px] text-slate-500 mt-1">{t('admin.settingsSubtitle')}</span></span></span>
          <input type="checkbox" className="accent-emerald-500 w-5 h-5 mt-1" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} />
        </label>

        <div className="flex justify-end"><Button size="lg" icon={Save} onClick={save}>{t('common.save')}</Button></div>
      </div>
    </div>
  );
}
