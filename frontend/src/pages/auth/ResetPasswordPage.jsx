import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../api/services';
import Logo from '../../components/common/Logo';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.resetPassword({ email, new_password: newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      alert('Reset failed. Check your email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-slate-950 dark:to-slate-900">
      <motion.div className="max-w-md w-full glass-card p-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-bold text-center">New Password</h1>
        {done ? (
          <p className="mt-6 text-center text-teal-500">Password updated! Redirecting to login...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input-field" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            <button type="submit" className="btn-primary w-full">Update Password</button>
          </form>
        )}
        <p className="text-center mt-6"><Link to="/login" className="text-violet-500 text-sm">Back to login</Link></p>
      </motion.div>
    </div>
  );
}
