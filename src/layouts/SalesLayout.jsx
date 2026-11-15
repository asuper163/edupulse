import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, Inbox, FileBarChart } from 'lucide-react';
import { useLanguage } from '../i18n/index.jsx';

export default function SalesLayout() {
  const { t } = useLanguage();
  const navItems = [
    { to: '/sales', icon: LayoutDashboard, label: t('sales.overview'), end: true },
    { to: '/sales/requests', icon: Inbox, label: t('sales.requests') },
    { to: '/sales/reports', icon: FileBarChart, label: t('sales.reports') },
  ];
  return <DashboardLayout navItems={navItems} notificationsPath="/sales/notifications" profilePath="/sales/profile" roleKey="sales" />;
}
