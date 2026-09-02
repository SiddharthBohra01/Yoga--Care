import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center pt-20 sm:pt-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
          alt="Yoga"
          className="w-full h-full object-cover opacity-20 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-100/80 via-white/90 to-white dark:from-slate-950/90 dark:via-slate-950/95 dark:to-slate-950" />
      </div>

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="hidden sm:block absolute top-32 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-violet-400/30 to-cyan-400/30 blur-3xl"
      />

      <div className="section-padding grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass-card text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-300 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 shrink-0" /> AI-Powered Personal Yoga Plans
          </span>
          <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] sm:leading-tight">
            Flow Into Your
            <span className="block gradient-text">Best Self</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            YogaCare delivers premium personalized 30-day yoga journeys. Track calories, build streaks, and transform on any device.
          </p>
          <div className="flex flex-col xs:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button type="button" onClick={() => navigate('/signup')} className="btn-primary w-full xs:w-auto gap-2">
              Start Free Trial <Play className="w-4 h-4" />
            </button>
            <a href="#plans" className="btn-secondary w-full xs:w-auto text-center">View Plans</a>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-8 mt-8 sm:mt-10 max-w-sm mx-auto lg:mx-0 lg:max-w-none">
            {[
              { n: '50K+', l: 'Active Users' },
              { n: '4.9★', l: 'App Rating' },
              { n: '30', l: 'Day Programs' },
            ].map((s) => (
              <div key={s.l} className="text-center lg:text-left">
                <p className="text-lg sm:text-2xl font-bold gradient-text">{s.n}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 leading-tight">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative max-w-md mx-auto lg:max-w-none w-full"
        >
          <div className="glass-card p-3 sm:p-4 rounded-2xl sm:rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1599901860904-17fb12c0b4b5?w=800&q=80"
              alt="Yoga practice"
              className="rounded-xl sm:rounded-2xl w-full aspect-[4/5] object-cover"
            />
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-2 left-2 sm:-bottom-4 sm:-left-4 glass-card px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl"
          >
            <p className="text-xl sm:text-2xl font-bold text-violet-600">🔥 12</p>
            <p className="text-xs sm:text-sm text-slate-500">Day Streak</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
