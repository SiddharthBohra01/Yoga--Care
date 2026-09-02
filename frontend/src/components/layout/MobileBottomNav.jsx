import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Droplets, Settings } from 'lucide-react';

const items = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/challenge', icon: Calendar, label: 'Challenge' },
  { path: '/water', icon: Droplets, label: 'Water' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom border-t border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl">
      <div className="flex items-stretch justify-around max-w-lg mx-auto px-1">
        {items.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[10px] sm:text-xs font-medium transition-colors ${
                active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
