import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Menu, X, LayoutDashboard, LogOut, Linkedin, Facebook, Music2, Instagram } from 'lucide-react';
import Logo from '../components/common/Logo';
import { useLanguage } from '../i18n/index.jsx';
import dashboardPath from '../utils/dashboardPath';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

export default function PublicLayout() {
  const { t } = useLanguage();
  const { isAuthenticated, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);

  const path = dashboardPath(role);
  const linkCls = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'}`;

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/instructors', label: t('nav.instructors') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden lg:flex items-center gap-6" aria-label="التنقل الرئيسي">
            {navLinks.map((l) => <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkCls}>{l.label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate(path)} icon={LayoutDashboard} className="hidden sm:inline-flex">{t('nav.dashboard')}</Button>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex h-10 px-4 items-center rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">{t('nav.login')}</Link>
                <Link to="/register" className="hidden sm:inline-flex h-10 px-4 items-center rounded-xl text-sm font-semibold bg-[#10B981] hover:bg-[#059669] text-white transition-colors">{t('nav.register')}</Link>
              </>
            )}
            <button className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')} aria-expanded={menuOpen}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 sm:px-6 py-4">
            <nav className="flex flex-col" aria-label="تنقل الجوال">
              {navLinks.map((l) => <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `py-3 px-3 rounded-xl font-semibold ${isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'}`}>{l.label}</NavLink>)}
              <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button onClick={() => navigate(path)} icon={LayoutDashboard}>{t('nav.dashboard')}</Button>
                    <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} icon={LogOut}>{t('nav.logout')}</Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 h-11 inline-flex items-center justify-center rounded-xl border border-slate-300 font-semibold text-slate-700">{t('nav.login')}</Link>
                    <Link to="/register" className="flex-1 h-11 inline-flex items-center justify-center rounded-xl bg-[#10B981] text-white font-semibold">{t('nav.register')}</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[#0B1120] text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo dark />
            <p className="text-sm leading-6 text-slate-400 mt-4">{t('footer.description')}</p>
            <div className="flex items-center gap-3 mt-4" aria-label="تواصل معنا على السوشيال">
              <a href="https://www.linkedin.com/company/edupulse" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-[#0A66C2] hover:text-white transition-colors"><Linkedin size={18} aria-hidden="true" /></a>
              <a href="https://www.facebook.com/edupulse.official" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-[#1877F2] hover:text-white transition-colors"><Facebook size={18} aria-hidden="true" /></a>
              <a href="https://www.tiktok.com/@edupulse" target="_blank" rel="noreferrer" aria-label="TikTok" className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-black hover:text-white transition-colors"><Music2 size={18} aria-hidden="true" /></a>
              <a href="https://www.instagram.com/edupulse" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-fuchsia-600 hover:text-white transition-colors"><Instagram size={18} aria-hidden="true" /></a>
            </div>
          </div>
          <nav aria-label={t('footer.platform')}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{t('footer.platform')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-emerald-400 transition-colors">{t('footer.courses')}</Link></li>
              <li><Link to="/categories" className="hover:text-emerald-400 transition-colors">{t('footer.categories')}</Link></li>
              <li><Link to="/instructors" className="hover:text-emerald-400 transition-colors">{t('footer.instructors')}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t('footer.company')}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t('footer.support')}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">{t('footer.helpCenter')}</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">{t('footer.faq')}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} EDUPULSE. {t('footer.rights')}</p>
            <p className="hidden sm:block">{t('footer.madeWith')}</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp contact — home page only */}
      {location.pathname === '/' && (
        <a
          href="https://wa.me/201001234567?text=مرحباً%20فريق%20EDUPULSE%20أريد%20الاستفسار%20عن%20الاشتراك"
          target="_blank" rel="noreferrer"
          aria-label="تواصل معنا عبر واتساب"
          className="fixed bottom-5 start-5 sm:bottom-8 sm:start-8 z-[60] flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-black py-3 px-4 shadow-[0_8px_24px_rgba(37,211,102,.45)] transition-all hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#10B981]"
        >
          <MessageCircle size={26} strokeWidth={2.4} fill="white" fillOpacity={0.25} aria-hidden="true" />
          <span className="hidden sm:inline text-sm">تواصل واتساب</span>
        </a>
      )}
    </div>
  );
}
