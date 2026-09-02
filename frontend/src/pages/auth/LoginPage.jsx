import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload;
      if (!user.onboarding_complete) navigate('/onboarding');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 safe-top safe-bottom bg-gradient-to-br from-violet-100 via-white to-cyan-100 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-center text-slate-500 text-sm mt-2">Continue your yoga journey</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm text-center">{typeof error === 'string' ? error : 'Login failed'}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-violet-500 hover:underline">Forgot password?</Link>
        </p>
        <p className="text-center mt-4 text-sm text-slate-500">
          No account? <Link to="/signup" className="text-violet-500 font-medium hover:underline">Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
}
