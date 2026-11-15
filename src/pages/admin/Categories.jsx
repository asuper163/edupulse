import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { categoryService } from '../../services/categoryService';
import { Input, Textarea, Select, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CATEGORY_ICONS, FALLBACK_CATEGORY_ICON } from '../../constants/categoryIcons';

const emptyForm = { nameAr: '', nameEn: '', descAr: '', descEn: '', image: '', icon: 'Code2', status: 'active' };
const ICON_KEYS = Object.keys(CATEGORY_ICONS);

export default function Categories() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);
  const [modal, setModal] = useState(null); // null | {} | {id}
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categories = useMemo(() => categoryService.getAll(), [tick]);

  const openModal = (cat) => {
    setForm(cat ? { nameAr: cat.name?.ar || '', nameEn: cat.name?.en || '', descAr: cat.description?.ar || '', descEn: cat.description?.en || '', image: cat.image || '', icon: cat.icon || 'Code2', status: cat.status || 'active' } : emptyForm);
    setModal(cat ? { id: cat.id } : {});
  };
  const save = () => {
    if (!form.nameAr.trim() || !form.nameEn.trim()) { toast.error(t('validation.required')); return; }
    const payload = { name: { ar: form.nameAr, en: form.nameEn }, description: { ar: form.descAr, en: form.descEn }, image: form.image.trim(), icon: form.icon, status: form.status };
    if (modal?.id) categoryService.update(modal.id, payload);
    else categoryService.create(payload);
    setModal(null);
    toast.success(t('admin.catSaved'));
    refresh();
  };
  const doDelete = () => {
    const res = categoryService.remove(confirmDelete.id);
    if (!res.ok) toast.error(t('admin.cannotDeleteCategory', { count: res.count }));
    else toast.success(t('admin.catDeleted'));
    setConfirmDelete(null);
    refresh();
  };

  return (
    <div>
      <PageHeader title={t('admin.categoriesTitle')} subtitle={t('admin.categoriesSubtitle')} actions={<Button icon={Plus} onClick={() => openModal(null)}>{t('admin.createCategory')}</Button>} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.icon] || FALLBACK_CATEGORY_ICON;
          return (
            <div key={cat.id} className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Icon size={22} className="text-emerald-400" aria-hidden="true" /></span>
                <span className={`text-[9px] font-black uppercase tracking-widest rounded-full px-2.5 py-1 ${cat.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}`}>{cat.status === 'active' ? t('status.active') : t('status.hidden')}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100 mt-3">{lang === 'ar' ? cat.name?.ar : cat.name?.en}</h2>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-4 mt-1 min-h-[2rem]">{lang === 'ar' ? cat.description?.ar : cat.description?.en}</p>
              <p className="text-[10px] text-slate-600 mt-2 tnum">{cat.courseCount} {t('admin.categoryHasCourses')}</p>
              <div className="flex justify-end gap-1 mt-auto pt-3 border-t border-[#1c2941]">
                <button className="p-2 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-[#1B2740]" onClick={() => openModal(cat)} aria-label={t('common.edit')}><Pencil size={15} /></button>
                <button className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmDelete(cat)} aria-label={t('common.delete')}><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? t('admin.editCategory') : t('admin.createCategory')}>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField dark label={t('admin.catNameAr')} htmlFor="cAr" required><Input dark id="cAr" dir="rtl" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></FormField>
            <FormField dark label={t('admin.catNameEn')} htmlFor="cEn" required><Input dark id="cEn" dir="ltr" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField dark label={t('admin.catDescAr')} htmlFor="cdAr"><Textarea dark id="cdAr" rows={2} dir="rtl" value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} /></FormField>
            <FormField dark label={t('admin.catDescEn')} htmlFor="cdEn"><Textarea dark id="cdEn" rows={2} dir="ltr" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField dark label={t('admin.catImage')} htmlFor="cIcon">
              <Select dark id="cIcon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {ICON_KEYS.map((key) => <option key={key} value={key}>{key}</option>)}
              </Select>
            </FormField>
            <FormField dark label={t('common.status')} htmlFor="cStatus">
              <Select dark id="cStatus" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">{t('status.active')}</option>
                <option value="archived">{t('status.archived')}</option>
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setModal(null)}>{t('common.cancel')}</Button><Button icon={Check} onClick={save}>{t('common.save')}</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} title={t('admin.categoriesTitle')} message={t('admin.confirmDeleteCategory')} confirmLabel={t('common.delete')} danger />
    </div>
  );
}
