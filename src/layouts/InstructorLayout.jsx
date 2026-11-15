import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, BookOpen, PlusCircle, Users, BarChart3, Star, UserCircle } from 'lucide-react';
import { useLanguage } from '../i18n/index.jsx';

export default function InstructorLayout() {
  const { t } = useLanguage();
  const navItems = [
    { to: '/instructor', icon: LayoutDashboard, label: t('instructor.overview'), end: true },
    { to: '/instructor/courses', icon: BookOpen, label: t('instructor.myCourses') },
    { to: '/instructor/courses/create', icon: PlusCircle, label: t('instructor.createCourse') },
    { to: '/instructor/students', icon: Users, label: t('instructor.students') },
    { to: '/instructor/analytics', icon: BarChart3, label: t('instructor.analytics') },
    { to: '/instructor/reviews', icon: Star, label: t('instructor.reviews') },
    { to: '/instructor/profile', icon: UserCircle, label: t('instructor.profile') },
  ];
  return <DashboardLayout navItems={navItems} notificationsPath="/instructor/notifications" profilePath="/instructor/profile" roleKey="instructor" />;
}
