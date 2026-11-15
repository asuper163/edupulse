import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, BookOpen, ClipboardList, Heart, Award, Bell, Settings, UserCircle } from 'lucide-react';
import { useLanguage } from '../i18n/index.jsx';

export default function StudentLayout() {
  const { t } = useLanguage();
  const navItems = [
    { to: '/student', icon: LayoutDashboard, label: t('student.overview'), end: true },
    { to: '/student/courses', icon: BookOpen, label: t('student.myCourses') },
    { to: '/student/quizzes', icon: ClipboardList, label: t('student.myQuizzes') },
    { to: '/student/wishlist', icon: Heart, label: t('student.wishlist') },
    { to: '/student/certificates', icon: Award, label: t('student.certificates') },
    { to: '/student/notifications', icon: Bell, label: t('student.notifications') },
    { to: '/student/settings', icon: Settings, label: t('student.settings') },
    { to: '/student/profile', icon: UserCircle, label: t('student.profile') },
  ];
  return <DashboardLayout navItems={navItems} notificationsPath="/student/notifications" profilePath="/student/profile" roleKey="student" />;
}
