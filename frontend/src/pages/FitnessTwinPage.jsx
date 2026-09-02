import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldAlert, Award, TrendingUp, Info } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userAPI } from '../api/services';

export default function FitnessTwinPage() {
  const [twinData, setTwinData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getFitnessTwin()
      .then((r) => setTwinData(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="skeleton h-96 rounded-2xl" />
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const regionsStatus = twinData?.regions_data || {};
  
  // Highlight helper for body parts
  const getPartColor = (partName) => {
    const score = regionsStatus[partName] || 0;
    if (score === 0) return 'stroke-orange-400 fill-orange-500/10 hover:fill-orange-500/25';
    if (score < 50) return 'stroke-cyan-400 fill-cyan-500/15 hover:fill-cyan-500/30';
    return 'stroke-teal-400 fill-teal-500/25 hover:fill-teal-500/40';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
          <div className="relative z-10">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">AI Integration</p>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mt-1">
              <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} /> Personalized Fitness Twin
            </h1>
            <p className="text-violet-100/90 text-sm mt-2 max-w-xl leading-relaxed">
              Your digital twin adapts in real-time as you complete poses. Explore weak areas, check flexibility metrics, and watch your fat loss projections grow.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* SVG Twin Avatar */}
          <div className="glass-card p-6 flex flex-col items-center space-y-6">
            <div className="text-center">
              <h3 className="font-bold text-lg">Interactive Body Map</h3>
              <p className="text-xs text-slate-400 mt-1">Hover over areas to view target muscle strength</p>
            </div>

            {/* Interactive SVG Human outline */}
            <div className="relative w-full max-w-[280px] h-[380px] bg-slate-500/5 rounded-2xl p-4 border border-white/10 flex justify-center items-center">
              <svg className="w-full h-full" viewBox="0 0 100 150">
                <defs>
                  <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>

                {/* Head */}
                <circle cx="50" cy="18" r="8" className="stroke-2 transition-colors duration-300 stroke-cyan-400 fill-cyan-500/10" />

                {/* Spine & Neck */}
                <line x1="50" y1="26" x2="50" y2="70" className={`stroke-2 transition-colors duration-300 ${getPartColor('Back & Spine')}`} />

                {/* Torso / Core */}
                <rect x="42" y="32" width="16" height="38" rx="4" className={`stroke-2 transition-colors duration-300 ${getPartColor('Core & Abs')}`} />

                {/* Left Arm */}
                <path d="M 40 34 L 28 58 L 22 75" className={`stroke-2 fill-none transition-colors duration-300 ${getPartColor('Shoulders & Arms')}`} />

                {/* Right Arm */}
                <path d="M 60 34 L 72 58 L 78 75" className={`stroke-2 fill-none transition-colors duration-300 ${getPartColor('Shoulders & Arms')}`} />

                {/* Left Leg */}
                <path d="M 44 70 L 38 105 L 34 140" className={`stroke-2 fill-none transition-colors duration-300 ${getPartColor('Hamstrings & Legs')}`} />

                {/* Right Leg */}
                <path d="M 56 70 L 62 105 L 66 140" className={`stroke-2 fill-none transition-colors duration-300 ${getPartColor('Hamstrings & Legs')}`} />
              </svg>

              {/* Status overlays */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-[9px] text-slate-300 p-2 rounded-lg border border-white/5 space-y-1">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /> Well-Trained</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Moderate</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Weak Area</div>
              </div>
            </div>
          </div>

          {/* Metrics & Analytics */}
          <div className="space-y-6">
            {/* Core Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Flexibility score */}
              <div className="glass-card p-5 space-y-2 flex flex-col justify-between">
                <div>
                  <Award className="w-6 h-6 text-violet-500 mb-1" />
                  <span className="text-xs text-slate-400 font-semibold block">Flexibility Score</span>
                  <span className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{twinData?.flexibility_score}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-violet-500 h-full" style={{ width: `${twinData?.flexibility_score}%` }} />
                </div>
              </div>

              {/* Fat Loss Predictions */}
              <div className="glass-card p-5 space-y-2 flex flex-col justify-between">
                <div>
                  <TrendingUp className="w-6 h-6 text-emerald-500 mb-1" />
                  <span className="text-xs text-slate-400 font-semibold block">Fat Loss Prediction</span>
                  <span className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{twinData?.fat_loss_prediction_kg} kg</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 leading-snug">
                  Estimated fat metabolized based on {Math.round(twinData?.total_calories)} total calories burned.
                </p>
              </div>
            </div>

            {/* Weak Areas Alerts */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-orange-500">
                <ShieldAlert className="w-5 h-5 shrink-0" /> Target Weak Spots
              </h3>
              
              <div className="space-y-3">
                {twinData?.weak_areas?.map((area, i) => (
                  <div key={i} className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10 flex items-start gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 uppercase mt-0.5">Weak</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{area}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {area === 'Core & Abs' ? 'Integrate Plank Pose or Boat Pose into your workouts.' :
                         area === 'Back & Spine' ? 'Incorporate Cobra Pose or Cat-Cow stretches.' :
                         area === 'Hamstrings & Legs' ? 'Try Pigeon Pose or Downward Dog for hamstring length.' :
                         area === 'Shoulders & Arms' ? 'Downward Dog and Plank Pose will help support upper stability.' :
                         'Focus on Tree Pose to increase neurological balance.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General progress analytics disclaimer */}
            <div className="glass-card p-5 flex items-start gap-3 text-slate-500">
              <Activity className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">How the Digital Twin Works</p>
                <p className="leading-relaxed">
                  The model analyzes the focus values of your completed poses. It aggregates the load on joints and muscles to identify weak regions and adapt your daily 30-day challenge plan accordingly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
