import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../api/services';
import Logo from '../../components/common/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-slate-950 dark:to-slate-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full glass-card p-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        {sent ? (
          <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
            If an account exists for {email}, you will receive reset instructions.
            <br /><br />
            <Link to="/reset-password" className="text-violet-500 font-medium">Set new password</Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input className="input-field" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
        <p className="text-center mt-6"><Link to="/login" className="text-violet-500 text-sm">Back to login</Link></p>
      </motion.div>
    </div>
  );
}
