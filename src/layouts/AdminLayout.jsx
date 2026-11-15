import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, Users, BookOpen, FolderTree, ClipboardList, ListChecks, Star, Award, FileText, Mail, Bell, Settings, Database } from 'lucide-react';
import { useLanguage } from '../i18n/index.jsx';

export default function AdminLayout() {
  const { t } = useLanguage();
  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.overview'), end: true },
    { to: '/admin/users', icon: Users, label: t('admin.users') },
    { to: '/admin/courses', icon: BookOpen, label: t('admin.courses') },
    { to: '/admin/categories', icon: FolderTree, label: t('admin.categories') },
    { to: '/admin/enrollments', icon: ClipboardList, label: t('admin.enrollments') },
    { to: '/admin/quizzes', icon: ListChecks, label: t('admin.quizzes') },
    { to: '/admin/reviews', icon: Star, label: t('admin.reviews') },
    { to: '/admin/certificates', icon: Award, label: t('admin.certificates') },
    { to: '/admin/reports', icon: FileText, label: t('admin.reports') },
    { to: '/admin/messages', icon: Mail, label: t('admin.messages') },
    { to: '/admin/notifications', icon: Bell, label: t('admin.notifications') },
    { to: '/admin/settings', icon: Settings, label: t('admin.settings') },
    { to: '/admin/data-management', icon: Database, label: t('admin.dataManagement') },
  ];
  return <DashboardLayout navItems={navItems} notificationsPath="/admin/notifications" profilePath="/admin/settings" roleKey="admin" />;
}
