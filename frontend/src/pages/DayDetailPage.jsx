import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Flame, ChevronRight, Check } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { planAPI } from '../api/services';

export default function DayDetailPage() {
  const { dayNumber } = useParams();
  const [day, setDay] = useState(null);

  useEffect(() => {
    planAPI.getDay(dayNumber).then((r) => setDay(r.data)).catch(() => {});
  }, [dayNumber]);

  if (!day) {
    return (
      <DashboardLayout>
        <div className="skeleton h-64 max-w-4xl mx-auto" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Link to="/challenge" className="text-violet-500 text-sm mb-4 inline-block">← Back to Challenge</Link>
        <div className="glass-card p-6 mb-8">
          <h1 className="text-2xl font-bold">{day.title}</h1>
          <p className="text-slate-500 mt-2">Focus: {day.focus} • {day.total_calories} cal total</p>
          <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
            <motion.div
              animate={{ width: `${(day.completed_count / day.total_exercises) * 100}%` }}
              className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
            />
          </div>
          <p className="text-sm mt-2 text-slate-500">{day.completed_count} of {day.total_exercises} exercises done</p>
        </div>

        <div className="space-y-4">
          {day.exercises?.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/exercise/${ex.id}`}
                className={`flex items-center gap-4 glass-card p-4 hover:bg-violet-500/5 transition-colors ${ex.is_completed ? 'opacity-70' : ''}`}
              >
                <img src={ex.image_url} alt={ex.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{ex.name}</h3>
                    {ex.is_completed && <Check className="w-4 h-4 text-teal-500" />}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.duration_seconds}s</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {ex.calories_burned} cal</span>
                    <span className="capitalize">{ex.difficulty}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
