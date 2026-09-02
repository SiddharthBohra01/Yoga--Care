import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#plans', label: 'Plans' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 py-2 sm:py-4 safe-top"
    >
      <div className="max-w-7xl mx-auto glass-card rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <Link to="/" className="min-w-0 shrink"><Logo size="sm" /></Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-violet-500 transition-colors whitespace-nowrap">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="btn-primary text-sm py-2.5 px-5"
          >
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button type="button" onClick={() => setOpen(!open)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden mt-2 mx-2 glass-card rounded-xl p-4 max-h-[70dvh] overflow-y-auto"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3.5 text-base text-slate-600 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => { setOpen(false); navigate(isAuthenticated ? '/dashboard' : '/login'); }}
              className="btn-primary w-full mt-4"
            >
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
