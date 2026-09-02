import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, Plus, CheckCircle, Info, Calendar } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sleepAPI } from '../api/services';

export default function SleepPage() {
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState('Good');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const histRes = await sleepAPI.getHistory();
      setHistory(histRes.data);
      const recRes = await sleepAPI.getRecommendations();
      setRecommendations(recRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogSleep = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sleepAPI.logSleep({
        sleep_hours: parseFloat(hours),
        sleep_quality: quality,
      });
      loadData();
    } catch {
      alert('Could not log sleep duration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Sleep Coaching</p>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mt-1">
                <Moon className="w-8 h-8 text-indigo-400" /> Sleep Tracker
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-lg leading-relaxed">
                Log your sleep hours and quality to receive customized yoga routines.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Earn +10 XP daily
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleLogSleep} className="glass-card p-6 space-y-5 h-fit">
            <h3 className="font-bold text-lg">Log Last Night's Sleep</h3>
            
            <div className="space-y-4">
              {/* Hours slider */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-slate-500">Sleep Duration:</span>
                  <span className="text-violet-600 dark:text-violet-400 text-base">{hours} hours</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  step="0.5"
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>

              {/* Quality options */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Sleep Quality</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Poor', 'Fair', 'Good', 'Excellent'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        quality === q
                          ? 'border-violet-600 bg-violet-600/10 text-violet-600 dark:text-violet-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-500/5'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Sleep Entry
            </button>
          </form>

          {/* Recommendations and AI Coaching */}
          {loading ? (
            <div className="skeleton h-64 lg:col-span-2 rounded-2xl" />
          ) : (
            <div className="lg:col-span-2 space-y-6">
              {/* AI Coaching card */}
              <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <div className="flex items-center gap-2 text-indigo-500 mb-3">
                  <Sparkles className="w-5.5 h-5.5" />
                  <h3 className="font-bold text-lg">AI Sleep Coach Recommendation</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {recommendations?.message}
                </p>

                {/* Specific suggestions */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-500/5 rounded-2xl p-4">
                    <h4 className="font-bold text-xs uppercase text-violet-500 tracking-wider mb-2">Recommended Poses</h4>
                    <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      {recommendations?.poses?.map((pose, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-violet-500 shrink-0" /> {pose}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-500/5 rounded-2xl p-4">
                    <h4 className="font-bold text-xs uppercase text-cyan-500 tracking-wider mb-2">Meditation Focus</h4>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      🧘 {recommendations?.meditation}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Try starting a breathing session based on this focus in Meditation mode.
                    </p>
                  </div>
                </div>
              </div>

              {/* History list */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" /> Sleep Log History
                </h3>
                <div className="overflow-y-auto max-h-[220px] space-y-3">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-6">No sleep logged yet. Log sleep above to populate history.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {history.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-xl border dark:border-slate-800">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block">
                              {new Date(log.logged_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </span>
                            <span className="text-base font-bold text-slate-800 dark:text-white mt-0.5 block">
                              {log.sleep_hours} hrs
                            </span>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            log.sleep_quality === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            log.sleep_quality === 'Good' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                            log.sleep_quality === 'Fair' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                            'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                            {log.sleep_quality}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
