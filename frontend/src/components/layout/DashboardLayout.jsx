import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Calendar, Droplets, Music, Trophy, Settings, LogOut, Menu, X, Shield,
  Users, Video, Utensils, Moon, Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import MobileBottomNav from './MobileBottomNav';
import { logout } from '../../store/authSlice';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/challenge', icon: Calendar, label: '30-Day Challenge' },
  { path: '/water', icon: Droplets, label: 'Water Tracker' },
  { path: '/meditation', icon: Music, label: 'Meditation' },
  { path: '/sleep', icon: Moon, label: 'Sleep Tracker' },
  { path: '/diet', icon: Utensils, label: 'Diet Planner' },
  { path: '/community', icon: Users, label: 'Community Hub' },
  { path: '/classes', icon: Video, label: 'Live Classes' },
  { path: '/twin', icon: Sparkles, label: 'Personal Twin' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const pageTitle = location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'dashboard';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-violet-950/30 dark:to-slate-900 overflow-x-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(85vw,280px)] lg:w-64 glass-card lg:m-4 lg:rounded-2xl p-4 sm:p-6 transform transition-transform duration-300 ease-out lg:translate-x-0 safe-top ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <button type="button" className="lg:hidden p-2 -mr-2" onClick={() => setSidebarOpen(false)} aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4 truncate">Welcome, {user?.full_name?.split(' ')[0]}</p>
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100dvh-200px)]">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                location.pathname === path || (path === '/challenge' && location.pathname.includes('/challenge'))
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-violet-500/10'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
          {user?.is_admin && (
            <Link to="/admin" className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm text-amber-600 hover:bg-amber-500/10 min-h-[44px]">
              <Shield className="w-5 h-5 shrink-0" /> Admin Panel
            </Link>
          )}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 sm:px-4 py-3 mt-6 text-red-500 hover:bg-red-500/10 rounded-xl w-full text-sm min-h-[44px]"
        >
          <LogOut className="w-5 h-5 shrink-0" /> Logout
        </button>
      </aside>

      <div className="lg:ml-[calc(16rem+2rem)] min-h-screen min-h-[100dvh] flex flex-col">
        <header className="sticky top-0 z-30 glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 safe-top">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              className="lg:hidden p-2 -ml-1 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-violet-500 font-medium uppercase tracking-wide">YogaCare</p>
              <h1 className="font-semibold text-base sm:text-lg capitalize truncate">{pageTitle}</h1>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 px-2 sm:px-4 py-3 sm:py-4 pb-24 lg:pb-8 max-w-6xl w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
