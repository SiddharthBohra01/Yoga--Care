import { motion } from 'framer-motion';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <motion.div
        whileHover={{ rotate: 12, scale: 1.05 }}
        className={`${sizes[size]} shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center shadow-lg shadow-violet-500/30`}
      >
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 text-white" fill="currentColor" aria-hidden>
          <path d="M12 3c-4 4-6 7-6 10a6 6 0 1 0 12 0c0-3-2-6-6-10zm0 14a4 4 0 0 1-4-4h8a4 4 0 0 1-4 4z" />
        </svg>
      </motion.div>
      {showText && (
        <span className={`font-display font-bold tracking-tight truncate ${textSizes[size]}`}>
          <span className="gradient-text">Yoga</span>
          <span className="text-slate-800 dark:text-white">Care</span>
        </span>
      )}
    </div>
  );
}
