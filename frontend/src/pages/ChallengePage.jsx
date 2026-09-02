import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Play, Trophy, Award, Flame, Target, Flame as Burner } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { planAPI, dashboardAPI } from '../api/services';

export default function ChallengePage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar'); // calendar, leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    planAPI.getMyPlan()
      .then((r) => setPlan(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    dashboardAPI.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const { data } = await dashboardAPI.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const progress = plan ? (plan.completed_days / plan.total_days) * 100 : 0;

  // Daily challenges progress check
  const calBurned = stats?.calories_today || 0;
  const isStreakMaintained = (stats?.current_streak || 0) > 0;

  const challenges = [
    { id: 1, title: 'Complete Today\'s Yoga Flow', goal: 'Unlock and finish any active day', current: plan?.completed_days > 0 ? 1 : 0, target: 1, isDone: plan?.completed_days > 0 },
    { id: 2, title: 'Calorie Burn Target', goal: 'Burn 150 kcal today', current: Math.round(calBurned), target: 150, isDone: calBurned >= 150 },
    { id: 3, title: 'Hold Plank Posture', goal: 'Maintain steady hold for 60 sec', current: stats?.completed_exercises > 0 ? 60 : 0, target: 60, isDone: stats?.completed_exercises > 0 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-500/10'
            }`}
          >
            30-Day Calendar
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-500/10'
            }`}
          >
            Challenges & Ranks
          </button>
        </div>

        {activeTab === 'calendar' ? (
          <div>
            <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-8 animate-fadeIn">
              <h2 className="text-lg sm:text-2xl font-bold leading-snug">{plan?.title || '30-Day Yoga Challenge'}</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 line-clamp-3 sm:line-clamp-none">{plan?.description}</p>
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>{plan?.completed_days || 0} days completed</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-28" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {plan?.days?.map((day, i) => (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={day.is_unlocked ? { y: -4 } : {}}
                  >
                    {day.is_unlocked ? (
                      <Link
                        to={`/challenge/day/${day.day_number}`}
                        className={`block glass-card p-3 sm:p-4 text-center relative overflow-hidden min-h-[88px] sm:min-h-0 ${
                          day.is_completed ? 'ring-2 ring-teal-500' : day.day_number === plan.current_day ? 'ring-2 ring-violet-500' : ''
                        }`}
                      >
                        {day.is_completed ? (
                          <Check className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                        ) : (
                          <Play className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                        )}
                        <p className="font-bold text-lg">Day {day.day_number}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">{day.focus}</p>
                        <p className="text-xs text-violet-500 mt-1">{day.completed_count}/{day.total_exercises}</p>
                      </Link>
                    ) : (
                      <div className="glass-card p-4 text-center opacity-50 cursor-not-allowed">
                        <Lock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="font-bold text-lg">Day {day.day_number}</p>
                        <p className="text-xs text-slate-500 mt-1">Locked</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Daily Challenges */}
            <div className="glass-card p-6 space-y-4 h-fit lg:col-span-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Award className="w-5.5 h-5.5 text-violet-500" /> Daily Challenges
              </h3>
              
              <div className="space-y-4">
                {challenges.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-500/5 rounded-2xl flex flex-col justify-between border dark:border-slate-800">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{c.title}</h4>
                        {c.isDone && <Check className="w-4.5 h-4.5 text-teal-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{c.goal}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Progress</span>
                      <span className={c.isDone ? 'text-teal-500' : 'text-violet-500'}>
                        {c.current} / {c.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="glass-card p-6 lg:col-span-2 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5.5 h-5.5 text-amber-500" /> Global Rankings
              </h3>

              {leaderboardLoading ? (
                <div className="space-y-3">
                  <div className="skeleton h-12 rounded-xl" />
                  <div className="skeleton h-12 rounded-xl" />
                  <div className="skeleton h-12 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leaderboard.map((item) => (
                    <div
                      key={item.rank}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        item.is_me
                          ? 'border-violet-500/50 bg-violet-500/5 shadow-md shadow-violet-500/5'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Rank indicator */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                            {item.name} {item.is_me && <span className="text-[10px] text-violet-500 font-semibold px-2 py-0.5 rounded-full bg-violet-500/10">You</span>}
                          </h4>
                          <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5 font-semibold">
                            <span className="flex items-center gap-0.5"><Target className="w-3 h-3 text-violet-500" /> {item.current_streak} days</span>
                            <span className="flex items-center gap-0.5"><Burner className="w-3 h-3 text-orange-500" /> {item.calories} kcal</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.xp} XP</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Rank score</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
