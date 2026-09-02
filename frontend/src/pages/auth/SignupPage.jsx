import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../../store/authSlice';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

const goals = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'strength', label: 'Strength' },
  { value: 'belly_fat', label: 'Belly Fat Reduction' },
  { value: 'full_body', label: 'Full Body Fitness' },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', age: 25,
    gender: 'female', height_cm: 165, weight_kg: 60,
    fitness_goal: 'full_body', experience_level: 'beginner',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(signupUser({ ...form, age: Number(form.age), height_cm: Number(form.height_cm), weight_kg: Number(form.weight_kg) }));
    if (signupUser.fulfilled.match(result)) navigate('/onboarding');
  };

  return (
    <div className="min-h-[100dvh] py-8 sm:py-12 px-3 sm:px-4 safe-top safe-bottom bg-gradient-to-br from-violet-100 via-white to-cyan-100 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto glass-card p-8">
        <div className="flex justify-center mb-4"><Logo /></div>
        <h1 className="text-2xl font-bold text-center">Start Your Free Trial</h1>
        <p className="text-center text-slate-500 text-sm mt-2">30 days of personalized yoga — completely free</p>

        <form onSubmit={handleSubmit} className="mt-8 grid sm:grid-cols-2 gap-4">
          <input className="input-field sm:col-span-2" placeholder="Full Name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          <input className="input-field sm:col-span-2" type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          <input className="input-field sm:col-span-2" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
          <input className="input-field" type="number" placeholder="Age" value={form.age} onChange={(e) => update('age', e.target.value)} required />
          <select className="input-field" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
          <input className="input-field" type="number" placeholder="Height (cm)" value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} required />
          <input className="input-field" type="number" placeholder="Weight (kg)" value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} required />
          <select className="input-field sm:col-span-2" value={form.fitness_goal} onChange={(e) => update('fitness_goal', e.target.value)}>
            {goals.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <select className="input-field sm:col-span-2" value={form.experience_level} onChange={(e) => update('experience_level', e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {error && <p className="text-red-500 text-sm sm:col-span-2 text-center">{typeof error === 'string' ? error : 'Signup failed'}</p>}
          <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 w-full">
            {loading ? 'Creating account...' : 'Create Account & Start Trial'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-violet-500 font-medium">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
