import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../api/services';
import Logo from '../components/common/Logo';
import LoadingScreen from '../components/common/LoadingScreen';

const steps = [
  { title: 'Welcome to YogaCare', desc: 'Your personalized 30-day yoga journey starts now.', emoji: '🪷' },
  { title: 'AI-Powered Plans', desc: 'We analyze your BMI, goals, and experience to craft your unique program.', emoji: '🧠' },
  { title: 'Track Everything', desc: 'Calories, water, streaks, and achievements — all in one beautiful dashboard.', emoji: '📊' },
  { title: 'Ready to Flow?', desc: "Let's generate your personalized plan!", emoji: '✨' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const finish = async () => {
    setLoading(true);
    try {
      await userAPI.completeOnboarding();
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch {
      navigate('/dashboard');
    }
  };

  if (loading) return <LoadingScreen message="Generating your personalized 30-day plan..." />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-600 via-purple-700 to-cyan-600">
      <div className="max-w-lg w-full glass-card p-10 text-center">
        <Logo />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="mt-8"
          >
            <span className="text-6xl">{steps[step].emoji}</span>
            <h2 className="text-2xl font-bold mt-6">{steps[step].title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">{steps[step].desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-8 bg-violet-500' : 'bg-slate-300'}`} />
          ))}
        </div>

        <button
          onClick={() => (step < steps.length - 1 ? setStep(step + 1) : finish())}
          className="btn-primary w-full mt-8"
        >
          {step < steps.length - 1 ? 'Continue' : 'Generate My Plan'}
        </button>
      </div>
    </div>
  );
}
