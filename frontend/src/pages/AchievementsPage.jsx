import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dashboardAPI } from '../api/services';

const allBadges = [
  { key: 'first_pose', title: 'First Flow', icon: '🌱' },
  { key: 'day_1', title: 'Day One Champion', icon: '🏆' },
  { key: 'streak_3', title: '3-Day Streak', icon: '🔥' },
  { key: 'streak_7', title: 'Week Warrior', icon: '⚡' },
  { key: 'streak_14', title: 'Fortnight Flow', icon: '💎' },
  { key: 'halfway', title: 'Halfway Hero', icon: '🎯' },
  { key: 'water_goal', title: 'Hydration Master', icon: '💧' },
  { key: 'calories_500', title: 'Calorie Crusher', icon: '🔥' },
];

export default function AchievementsPage() {
  const [earned, setEarned] = useState([]);

  useEffect(() => {
    dashboardAPI.getAchievements().then((r) => setEarned(r.data)).catch(() => {});
  }, []);

  const earnedKeys = new Set(earned.map((b) => b.badge_key));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Achievement Badges</h2>
        <p className="text-slate-500 mb-8">{earned.length} of {allBadges.length} unlocked</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {allBadges.map((badge, i) => {
            const unlocked = earnedKeys.has(badge.key);
            const info = earned.find((e) => e.badge_key === badge.key);
            return (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-6 text-center ${unlocked ? '' : 'opacity-40 grayscale'}`}
              >
                <span className="text-4xl">{badge.icon}</span>
                <h3 className="font-semibold mt-3 text-sm">{info?.title || badge.title}</h3>
                {unlocked && info && (
                  <p className="text-xs text-slate-500 mt-1">{new Date(info.earned_at).toLocaleDateString()}</p>
                )}
                {!unlocked && <p className="text-xs text-slate-400 mt-1">Locked</p>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
