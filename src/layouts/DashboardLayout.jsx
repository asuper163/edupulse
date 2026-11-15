import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut, ExternalLink, ChevronDown, User } from 'lucide-react';
import Logo from '../components/common/Logo';
import Avatar from '../components/common/Avatar';
import Dropdown from '../components/common/Dropdown';
import { useLanguage } from '../i18n/index.jsx';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

// Shared dark dashboard shell for student / instructor / admin
export default function DashboardLayout({ navItems, notificationsPath, profilePath, roleKey }) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setSidebarOpen(false); window.scrollTo({ top: 0 }); }, [location.pathname]);

  const unread = useMemo(() => (user ? notificationService.unreadCount(user.id) : 0), [user, location.pathname]);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#1c2941]">
        <Logo dark />
        <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)} aria-label={t('nav.closeMenu')}>
          <X size={20} />
        </button>
      </div>
      <div className="px-5 pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
          {t(`roles.${roleKey}`)}
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto dark-scroll px-3 pb-4" aria-label="تنقل لوحة التحكم">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? item.to.split('/').length === 2}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#10B981] text-[#0B1120] font-bold shadow-[0_0_18px_rgb(16_185_129/0.25)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1B2740]'
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ms-auto text-[10px] font-bold bg-emerald-500 text-[#0B1120] rounded-full px-2 py-0.5 tnum">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-4 pb-5 border-t border-[#1c2941] pt-4 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-200 hover:bg-[#1B2740] transition-colors">
          <ExternalLink size={16} aria-hidden="true" /> EDUPULSE — {t('nav.home')}
        </Link>
        <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/90 hover:text-red-300 hover:bg-red-500/5 transition-colors">
          <LogOut size={16} aria-hidden="true" /> {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 start-0 w-72 bg-[#151F32] border-e border-[#1c2941] z-40">{sidebar}</aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" aria-label={t('nav.closeMenu')} onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-72 bg-[#151F32] border-e border-[#1c2941]">{sidebar}</aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:ps-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#0B1120]/85 backdrop-blur-lg border-b border-[#1c2941] flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-[#1B2740]" onClick={() => setSidebarOpen(true)} aria-label={t('nav.openMenu')} aria-expanded={sidebarOpen}>
              <Menu size={20} />
            </button>
            <p className="hidden md:block text-xs text-slate-500 font-medium">EDUPULSE</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={notificationsPath} aria-label={t('nav.notifications')} className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#1B2740] transition-colors">
              <Bell size={19} aria-hidden="true" />
              {unread > 0 && <span className="absolute top-1 end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-[9px] font-bold text-[#0B1120] flex items-center justify-center tnum">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <Dropdown
              dark
              trigger={
                <span className="flex items-center gap-2 p-1.5 pe-2 rounded-xl hover:bg-[#1B2740] transition-colors">
                  <Avatar name={user?.name} src={user?.avatar} size={34} />
                  <span className="hidden sm:block text-start">
                    <span className="block text-xs font-bold text-slate-100 max-w-[120px] truncate">{user?.name}</span>
                    <span className="block text-[10px] text-slate-500">{t(`roles.${roleKey}`)}</span>
                  </span>
                  <ChevronDown size={14} className="text-slate-500" aria-hidden="true" />
                </span>
              }
              items={[
                { label: t('nav.myProfile'), icon: User, onClick: () => navigate(profilePath) },
                { divider: true },
                { label: t('nav.logout'), icon: LogOut, danger: true, onClick: () => { logout(); navigate('/login'); } },
              ]}
            />
          </div>
        </header>

        {/* Routed page */}
        <main className="flex-1 p-4 sm:p-6 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
