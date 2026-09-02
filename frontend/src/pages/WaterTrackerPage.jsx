import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dashboardAPI } from '../api/services';

export default function WaterTrackerPage() {
  const [glasses, setGlasses] = useState(0);
  const goal = 8;

  const refresh = () => {
    dashboardAPI.getStats().then((r) => setGlasses(r.data.water_glasses_today)).catch(() => {});
  };

  useEffect(() => { refresh(); }, []);

  const addGlass = async () => {
    await dashboardAPI.logWater(1);
    refresh();
  };

  const percent = Math.min((glasses / goal) * 100, 100);

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10"
        >
          <Droplets className="w-16 h-16 text-cyan-500 mx-auto" />
          <h2 className="text-3xl font-bold mt-4">{glasses} / {goal}</h2>
          <p className="text-slate-500">Glasses today</p>

          <div className="mt-8 h-48 w-24 mx-auto bg-slate-200 dark:bg-slate-700 rounded-b-3xl rounded-t-lg relative overflow-hidden">
            <motion.div
              animate={{ height: `${percent}%` }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300"
            />
          </div>

          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {[...Array(goal)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-12 rounded-b-lg border-2 ${i < glasses ? 'bg-cyan-400 border-cyan-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
            ))}
          </div>

          <button onClick={addGlass} className="btn-primary mt-8 flex items-center gap-2 mx-auto">
            <Plus className="w-5 h-5" /> Add Glass (250ml)
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
