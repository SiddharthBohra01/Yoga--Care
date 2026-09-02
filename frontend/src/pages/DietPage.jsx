import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Salad, Plus, Trash2, Flame, Sparkles, Scale, Info } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dietAPI } from '../api/services';

export default function DietPage() {
  const [dietPlan, setDietPlan] = useState(null);
  const [history, setHistory] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const planRes = await dietAPI.getPlan();
      setDietPlan(planRes.data);
      const histRes = await dietAPI.getHistory();
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!foodName.trim() || !calories || !protein) return;
    setSubmitting(true);
    try {
      await dietAPI.logMeal({
        meal_type: mealType,
        food_name: foodName,
        calories: parseFloat(calories),
        protein_g: parseFloat(protein),
      });
      setFoodName('');
      setCalories('');
      setProtein('');
      loadData();
    } catch {
      alert('Could not log meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await dietAPI.deleteMeal(id);
      loadData();
    } catch {
      alert('Could not delete meal');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="skeleton h-64 rounded-2xl md:col-span-2" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const calToday = history?.today_calories || 0;
  const protToday = history?.today_protein || 0;

  const calTarget = dietPlan?.target_calories || 2000;
  const protTarget = dietPlan?.target_protein_g || 80;

  const calPercent = Math.min(100, Math.round((calToday / calTarget) * 100));
  const protPercent = Math.min(100, Math.round((protToday / protTarget) * 100));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider">Health & Nutrition</p>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mt-1">
                <Salad className="w-8 h-8" /> Smart Diet Planner
              </h1>
              <p className="text-teal-100/90 text-sm mt-2 max-w-lg leading-relaxed">
                Personalized nutrition suggestions matched with your body weight and yoga goal.
              </p>
            </div>
            <div className="bg-white/20 rounded-xl px-5 py-3 border border-white/10 shrink-0 text-center">
              <span className="text-[10px] uppercase font-bold text-teal-100 block">Current BMI</span>
              <span className="text-3xl font-bold">{dietPlan?.bmi}</span>
              <span className="text-xs font-medium text-emerald-100 block mt-1 capitalize">{dietPlan?.diet_type}</span>
            </div>
          </div>
        </div>

        {/* Targets and trackers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Calorie Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Flame className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Calories Consumed</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {Math.round(calToday)} <span className="text-sm font-normal text-slate-400">/ {calTarget} kcal</span>
              </p>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Daily Intake</span>
                <span>{calPercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${calPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Protein Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-500 mb-2">
                <Sparkles className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Protein Tracker</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                {protToday}g <span className="text-sm font-normal text-slate-400">/ {protTarget}g</span>
              </p>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Muscle Recovery Goal</span>
                <span>{protPercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                  style={{ width: `${protPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Water log link */}
          <div className="glass-card p-6 flex flex-col justify-between bg-gradient-to-br from-cyan-500/5 to-teal-500/5">
            <div>
              <div className="flex items-center gap-2 text-cyan-500 mb-2">
                <Scale className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Daily Targets</h3>
              </div>
              <ul className="text-sm space-y-2 mt-3 text-slate-600 dark:text-slate-400">
                <li className="flex justify-between">
                  <span>Target Calories:</span>
                  <strong className="font-bold text-slate-800 dark:text-white">{calTarget} kcal</strong>
                </li>
                <li className="flex justify-between">
                  <span>Protein Target:</span>
                  <strong className="font-bold text-slate-800 dark:text-white">{protTarget}g</strong>
                </li>
                <li className="flex justify-between">
                  <span>Water Goal:</span>
                  <strong className="font-bold text-slate-800 dark:text-white">3,000 ml</strong>
                </li>
              </ul>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-4">
              <Info className="w-3.5 h-3.5 shrink-0" /> Recalculates dynamically if your weight changes.
            </p>
          </div>
        </div>

        {/* Meal Suggestions */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-xl mb-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Salad className="w-5.5 h-5.5" /> AI Recommended Meal Plan
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(dietPlan?.suggested_meals || {}).map(([meal, desc]) => (
              <div key={meal} className="p-4 bg-slate-500/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">{meal}</h4>
                  <p className="text-sm font-semibold mt-2 text-slate-800 dark:text-slate-200 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log meal inputs and list history */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add meal */}
          <form onSubmit={handleAddMeal} className="glass-card p-6 space-y-4 h-fit">
            <h3 className="font-bold text-lg">Log Your Meal</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="input-field py-2 text-sm"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snack</option>
                  <option>Dinner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Food Item</label>
                <input
                  type="text"
                  placeholder="e.g. Scrambled Eggs with toast"
                  className="input-field text-sm"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="250"
                    className="input-field text-sm"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="12"
                    className="input-field text-sm"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    required
                    min="0"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1 mt-2"
            >
              <Plus className="w-4 h-4" /> Add Meal log
            </button>
          </form>

          {/* Meals History */}
          <div className="glass-card p-6 lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg">Daily Consumption Log</h3>
            <div className="overflow-y-auto max-h-[360px] space-y-3">
              {(!history?.meals || history.meals.length === 0) ? (
                <p className="text-slate-500 text-sm py-8 text-center">No meals logged today. Use the form to add yours!</p>
              ) : (
                <AnimatePresence>
                  {history.meals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-4 bg-slate-500/5 hover:bg-slate-500/10 rounded-2xl transition-all"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-violet-500 block">{meal.meal_type}</span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{meal.food_name}</h4>
                        <span className="text-xs text-slate-400">{meal.calories} kcal • {meal.protein_g}g protein</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-2.5 rounded-full hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
