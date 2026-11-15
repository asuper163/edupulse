import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Phone, Shield, Eye, EyeOff, KeyRound, BookOpen, ClipboardList, Award, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Select, FormField } from '../../components/common/FormControls';
import { courseService } from '../../services/courseService';
import { storageAdapter } from '../../storage/storageAdapter';
import { learningService } from '../../services/learningService';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/Feedback';
import { formatDate } from '../../utils/format';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { localized } from '../../utils/localized';

export default function UserDetails() {
  const { userId } = useParams();
  const { t, lang, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const data = useMemo(() => {
    const user = userService.getById(userId);
    if (!user) return null;
    const privateRecord = userService.getPrivateById(userId);
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => e.studentId === userId);
    const certificates = storageAdapter.getCollection('certificates').filter((c) => c.studentId === userId);
    const courses = user.role === 'instructor' ? courseService.getByInstructor(userId) : [];
    const avgProgress = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + learningService.getProgress(userId, e.courseId).percentage, 0) / enrollments.length) : 0;
    return { user, privateRecord, enrollments, certificates, courses, avgProgress };
  }, [userId]);

  if (!data) return <div className="text-center py-20 text-slate-400">{t('common.noData')}</div>;
  const { user, privateRecord, enrollments, certificates, courses, avgProgress } = data;
  const currentRole = role ?? user.role;
  const isSelf = currentUser?.id === user.id;
  const confirmRoleChange = () => {
    userService.update(user.id, { role: pendingRole });
    setRole(pendingRole);
    setPendingRole(null);
    toast.success(t('admin.roleChanged'));
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('admin.userDetails')} actions={<button onClick={() => navigate('/admin/users')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-100"><BackIcon size={14} aria-hidden="true" />{t('common.back')}</button>} />

      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-6 flex flex-col sm:flex-row gap-6">
        <Avatar name={user.name} src={user.avatar} size={96} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black text-slate-100">{user.name}</h2><StatusBadge status={user.status} /></div>
          <p className="text-xs text-slate-500 font-mono mt-1" dir="ltr">{user.email}</p>
          {/* Admin-only: see/edit this user's stored demo password */}
          <div className="flex items-center gap-2 mt-2.5 rounded-xl border border-[#1c2941] bg-[#0B1120] px-3 py-2 w-fit" dir="ltr">
            <KeyRound size={13} className="text-amber-400" aria-hidden="true" />
            <code className="text-[11px] tracking-wider text-amber-300 select-all">{showPassword ? (privateRecord?.password || '—') : '••••••••'}</code>
            <button onClick={() => setShowPassword((v) => !v)} className="p-1 text-slate-500 hover:text-slate-200 transition-colors" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
              {showPassword ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5"><Shield size={13} aria-hidden="true" />{t(`roles.${currentRole}`)}</span>
            {user.phone && <span className="inline-flex items-center gap-1.5" dir="ltr"><Phone size={13} aria-hidden="true" />{user.phone}</span>}
            <span>{t('common.date')}: {formatDate(user.createdAt, locale)}</span>
          </div>
          {user.bio && <p className="text-xs text-slate-400 leading-6 mt-3 border-t border-[#1c2941] pt-3">{user.bio}</p>}
        </div>
      </div>

      {/* Change role — admin can re-assign this user's permissions */}
      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400"><Users size={14} className="text-emerald-400" aria-hidden="true" />{t('admin.changeRole')}</div>
        <div className="flex-1 max-w-xs">
          <Select dark value={currentRole} onChange={(e) => { if (e.target.value !== currentRole) setPendingRole(e.target.value); }} aria-label={t('admin.roleLabel')} disabled={isSelf}>
            <option value="student">{t('roles.student')}</option>
            <option value="instructor">{t('roles.instructor')}</option>
            <option value="sales">{t('roles.sales')}</option>
            <option value="admin">{t('roles.admin')}</option>
          </Select>
        </div>
        {isSelf && <p className="text-[10px] text-slate-600">{t('admin.selfRoleLocked')}</p>}
      </div>

      <ConfirmDialog open={!!pendingRole} onClose={() => setPendingRole(null)} onConfirm={confirmRoleChange} title={t('admin.roleChangeTitle')} message={t('admin.roleChangeMessage')} confirmLabel={t('admin.roleChangeConfirm')} danger />

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 text-center"><ClipboardList size={18} className="text-emerald-400 mx-auto" aria-hidden="true" /><p className="text-xl font-black text-slate-100 tnum mt-1">{enrollments.length}</p><p className="text-[10px] text-slate-500 font-bold">{t('admin.enrollments')}</p></div>
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 text-center"><Award size={18} className="text-amber-400 mx-auto" aria-hidden="true" /><p className="text-xl font-black text-slate-100 tnum mt-1">{certificates.length}</p><p className="text-[10px] text-slate-500 font-bold">{t('student.certificates')}</p></div>
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 text-center"><BookOpen size={18} className="text-sky-400 mx-auto" aria-hidden="true" /><p className="text-xl font-black text-slate-100 tnum mt-1">{user.role === 'instructor' ? courses.length : `${avgProgress}%`}</p><p className="text-[10px] text-slate-500 font-bold">{user.role === 'instructor' ? t('instructor.myCourses') : t('student.overallProgress')}</p></div>
      </div>

      {user.role === 'instructor' && courses.length > 0 && (
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t('instructor.myCourses')}</h3>
          <ul className="divide-y divide-[#1c2941]">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-xs text-slate-200 truncate">{localized(c.title, lang)}</span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
