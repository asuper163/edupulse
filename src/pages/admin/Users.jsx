import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Search, UserPlus, Pencil, Ban, CheckCircle2, Trash2, Users as UsersIcon, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { userService } from '../../services/userService';
import { Input, Select, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import { StatusBadge, EmptyState } from '../../components/common/Feedback';
import { formatDate } from '../../utils/format';

const emptyForm = { name: '', email: '', password: '', role: 'student', status: 'active' };

export default function Users() {
  const { t, locale } = useLanguage();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | {id}
  const [form, setForm] = useState(emptyForm);
  const [confirmSuspend, setConfirmSuspend] = useState(null); // {id, suspend}
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingRoleChange, setPendingRoleChange] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const users = useMemo(() => userService.getAll({ query, role, status }), [query, role, status, tick]);

  const [showPassword, setShowPassword] = useState(false);

  const openModal = (target) => {
    if (target === 'create') { setForm(emptyForm); setModal('create'); setShowPassword(false); return; }
    const u = userService.getPrivateById(target.id);
    setForm({ name: u.name, email: u.email, password: u.password || '', role: u.role, status: u.status });
    setShowPassword(false);
    setModal({ id: u.id });
  };
  const persist = () => {
    if (modal === 'create') {
      const res = userService.create(form);
      if (!res.ok) { toast.error(res.error === 'email_exists' ? t('auth.emailExists') : t('errors.generic')); return; }
    } else {
      userService.update(modal.id, { name: form.name, email: form.email, role: form.role, status: form.status, ...(form.password ? { password: form.password } : {}) });
    }
    setModal(null);
    setPendingRoleChange(false);
    toast.success(t('admin.userSaved'));
    refresh();
  };
  const save = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error(t('validation.required')); return; }
    if (modal === 'create') {
      if (!form.password.trim()) { toast.error(t('validation.required')); return; }
      persist();
      return;
    }
    // Warn before changing a user's role — permissions change completely.
    const original = userService.getPrivateById(modal.id)?.role;
    if (original && original !== form.role) { setPendingRoleChange(true); return; }
    persist();
  };
  const toggleStatus = (u) => {
    const suspend = u.status === 'active';
    userService.setStatus(u.id, suspend ? 'suspended' : 'active');
    toast.success(suspend ? t('admin.userSuspended') : t('admin.userActivated'));
    setConfirmSuspend(null);
    refresh();
  };
  const doDelete = () => {
    const res = userService.remove(confirmDelete.id);
    if (!res.ok) toast.error(t('admin.cannotDeleteUser'));
    else toast.success(t('admin.userDeleted'));
    setConfirmDelete(null);
    refresh();
  };

  const isSelf = (u) => u.id === currentUser.id;

  return (
    <div>
      <PageHeader title={t('admin.usersTitle')} subtitle={t('admin.usersSubtitle')} actions={<Button icon={UserPlus} onClick={() => openModal('create')}>{t('admin.createUser')}</Button>} />
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="flex-1"><Input dark icon={Search} placeholder={t('admin.searchUsers')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>
        <Select dark value={role} onChange={(e) => setRole(e.target.value)} aria-label={t('admin.filterRole')} className="sm:w-44">
          <option value="">{t('admin.filterRole')}: {t('common.all')}</option>
          <option value="admin">{t('roles.admin')}</option>
          <option value="instructor">{t('roles.instructor')}</option>
          <option value="student">{t('roles.student')}</option>
          <option value="sales">{t('roles.sales')}</option>
        </Select>
        <Select dark value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('admin.filterStatus')} className="sm:w-40">
          <option value="">{t('admin.filterStatus')}: {t('common.all')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="suspended">{t('status.suspended')}</option>
        </Select>
      </div>

      {users.length === 0 ? <EmptyState icon={UsersIcon} title={t('common.noData')} /> : (
        <div className="rounded-2xl border border-[#1c2941] overflow-hidden">
          <table className="w-full text-xs table-auto">
              <thead className="bg-[#111a2e] text-slate-500"><tr><th className="text-start px-3 py-3 font-bold">{t('common.name')}</th><th className="text-start px-3 py-3 font-bold hidden sm:table-cell">{t('admin.roleLabel')}</th><th className="text-start px-3 py-3 font-bold">{t('admin.statusLabel')}</th><th className="text-start px-3 py-3 font-bold hidden md:table-cell">{t('common.date')}</th><th className="text-end px-3 py-3 font-bold">{t('common.actions')}</th></tr></thead>
              <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#182238] transition-colors">
                    <td className="px-3 py-2.5"><button onClick={() => navigate(`/admin/users/${u.id}`)} className="flex items-center gap-2.5 text-start group min-w-0"><Avatar name={u.name} src={u.avatar} size={34} /><span className="min-w-0"><span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors block line-clamp-1">{u.name}</span><span className="text-[9px] text-slate-500 block truncate" dir="ltr">{u.email}</span></span></button></td>
                    <td className="px-3 py-2.5 text-slate-300 hidden sm:table-cell">{t(`roles.${u.role}`)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="px-3 py-2.5 text-slate-500 hidden md:table-cell tnum">{formatDate(u.createdAt, locale, { year: 'numeric', month: 'short' })}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-[#1B2740]" onClick={() => openModal(u)} aria-label={t('common.edit')} disabled={isSelf(u)}><Pencil size={15} /></button>
                        <button className={`p-2 rounded-lg hover:bg-[#1B2740] ${u.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`} onClick={() => setConfirmSuspend(u)} aria-label={u.status === 'active' ? t('admin.suspend') : t('admin.activate')} disabled={isSelf(u)}>{u.status === 'active' ? <Ban size={15} /> : <CheckCircle2 size={15} />}</button>
                        <button className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmDelete(u)} aria-label={t('admin.deleteUser')} disabled={isSelf(u)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Create / edit modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? t('admin.createUser') : t('admin.editUser')}>
        <div className="grid gap-3">
          <FormField dark label={t('auth.fullName')} htmlFor="uName" required><Input dark id="uName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField dark label={t('auth.email')} htmlFor="uEmail" required><Input dark id="uEmail" type="email" dir="ltr" className="text-start" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
          <FormField dark label={`${t('admin.passwordLabel')}${modal === 'create' ? ' *' : ''}`} htmlFor="uPass" hint={modal === 'create' ? undefined : '(مرئية للمدير — النسخة التجريبية تخزنها كنص عادي)'}>
            <div className="relative">
              <Input dark id="uPass" type={showPassword ? 'text' : 'password'} dir="ltr" className="text-start" autoComplete="new-password" placeholder={modal === 'create' ? 'Demo123' : ''} style={{ paddingInlineEnd: '2.75rem' }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 hover:text-slate-200 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField dark label={t('admin.roleLabel')} htmlFor="uRole">
              <Select dark id="uRole" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">{t('roles.student')}</option>
                <option value="instructor">{t('roles.instructor')}</option>
                <option value="sales">{t('roles.sales')}</option>
                <option value="admin">{t('roles.admin')}</option>
              </Select>
            </FormField>
            <FormField dark label={t('admin.statusLabel')} htmlFor="uStatus">
              <Select dark id="uStatus" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">{t('status.active')}</option>
                <option value="suspended">{t('status.suspended')}</option>
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-2"><Button variant="secondary-dark" onClick={() => setModal(null)}>{t('common.cancel')}</Button><Button onClick={save}>{t('common.save')}</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmSuspend} onClose={() => setConfirmSuspend(null)} onConfirm={() => toggleStatus(confirmSuspend)} title={confirmSuspend?.status === 'active' ? t('admin.suspend') : t('admin.activate')} message={confirmSuspend?.status === 'active' ? t('admin.confirmSuspend') : t('admin.confirmActivate')} confirmLabel={confirmSuspend?.status === 'active' ? t('admin.suspend') : t('admin.activate')} danger={confirmSuspend?.status === 'active'} />
      <ConfirmDialog open={pendingRoleChange} onClose={() => setPendingRoleChange(false)} onConfirm={persist} title={t('admin.roleChangeTitle')} message={t('admin.roleChangeMessage')} confirmLabel={t('admin.roleChangeConfirm')} danger />
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} title={t('admin.deleteUser')} message={t('admin.confirmDeleteUser')} confirmLabel={t('common.delete')} danger />
    </div>
  );
}
