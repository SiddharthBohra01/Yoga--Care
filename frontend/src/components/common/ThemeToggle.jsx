import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleTheme } from '../../store/themeSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s) => s.theme.darkMode);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => dispatch(toggleTheme())}
      className="p-2.5 rounded-full glass-card hover:bg-violet-500/20 transition-colors"
      aria-label="Toggle theme"
    >
      {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-violet-600" />}
    </motion.button>
  );
}
