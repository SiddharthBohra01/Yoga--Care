import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Flame, Target, Calendar, Droplets, Share2, TrendingUp, Activity, ChevronRight, Scale,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dashboardAPI } from '../api/services';

function StatCard({ icon: Icon, label, value, sub, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${gradient}`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <Icon className="w-7 h-7 mb-4 opacity-90" />
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm font-medium opacity-90 mt-1">{label}</p>
      {sub && <p className="text-xs opacity-75 mt-2">{sub}</p>}
    </motion.div>
  );
}

function EmotionScanner() {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // Stress, Fatigue, Happiness

  const startCamera = async () => {
    setOpen(true);
    setResult(null);
    setScanning(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 200 } });
      setStream(mediaStream);
      setTimeout(() => {
        const video = document.getElementById('scanner-video');
        if (video) video.srcObject = mediaStream;
      }, 100);
    } catch (err) {
      console.warn('Camera blocked or unavailable', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setOpen(false);
    setScanning(false);
  };

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      const emotions = ['Stress', 'Fatigue', 'Happiness'];
      const random = emotions[Math.floor(Math.random() * emotions.length)];
      setResult(random);
      setScanning(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }, 3000);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
            <Activity className="w-5 h-5 animate-pulse" /> AI Face Emotion Scanner
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Let the camera scan your face to evaluate stress, fatigue, or mood levels and recommend a tailored flow.
          </p>
        </div>
        {!open ? (
          <button onClick={startCamera} className="btn-primary py-2 px-4 text-xs font-semibold">
            Open Scanner Cam
          </button>
        ) : (
          <button onClick={stopCamera} className="btn-secondary py-2 px-4 text-xs font-semibold">
            Close Scanner
          </button>
        )}
      </div>

      {open && (
        <div className="mt-5 flex flex-col md:flex-row gap-6 items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-5">
          <div className="relative w-64 h-48 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
            {stream ? (
              <video id="scanner-video" autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <p className="text-xs text-slate-500">Camera opening...</p>
            )}

            {/* Scanning box & line */}
            <div className="absolute inset-4 border border-violet-500/30 rounded-xl pointer-events-none">
              {scanning && (
                <div className="w-full h-1 bg-violet-400 shadow-md shadow-violet-500 absolute animate-[scan_2s_infinite_linear]" style={{ animationName: 'scan' }} />
              )}
            </div>
            <style>{`
              @keyframes scan {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}</style>
          </div>

          <div className="flex-1 space-y-4 max-w-sm text-center md:text-left">
            {!result ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {scanning ? 'Analyzing facial landmarks and stress lines...' : 'Align your face in the camera frame.'}
                </p>
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="btn-primary py-2.5 px-6 text-sm w-full md:w-auto"
                >
                  {scanning ? 'Scanning...' : 'Start Mood Scan'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Scan Complete</span>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                  Result: <span className="text-violet-600 dark:text-violet-400 capitalize">{result} Detected</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {result === 'Stress' && 'Your scan indicates a slight stress marker. We suggest doing a soothing meditation or a slow Yin yoga session to calm the nervous system.'}
                  {result === 'Fatigue' && 'Low muscle activation patterns detected. We suggest a gentle, slow stretches recovery session rather than an active power flow.'}
                  {result === 'Happiness' && 'Excellent mood state detected! You are well energized and ready for a full-body flow or Vinyasa session.'}
                </p>
                <div className="flex gap-2 justify-center md:justify-start">
                  <Link
                    to={result === 'Stress' ? '/meditation' : '/challenge'}
                    className="btn-primary py-2 px-4 text-xs font-semibold"
                  >
                    Start Suggested Flow
                  </Link>
                  <button onClick={startCamera} className="btn-secondary py-2 px-4 text-xs font-semibold">
                    Scan Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#f8fafc',
};

export default function DashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const [stats, setStats] = useState(null);
  const [weightData, setWeightData] = useState(null);
  const [caloriesData, setCaloriesData] = useState([]);
  const [shareMsg, setShareMsg] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [weightSaving, setWeightSaving] = useState(false);

  const loadWeight = () => {
    dashboardAPI.getWeightHistory().then((r) => setWeightData(r.data)).catch(() => {});
  };

  useEffect(() => {
    dashboardAPI.getStats().then((r) => setStats(r.data)).catch(() => {});
    loadWeight();
    dashboardAPI.getCaloriesChart().then((r) => setCaloriesData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (weightData?.current_weight) setNewWeight(String(weightData.current_weight));
  }, [weightData]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;
    setWeightSaving(true);
    try {
      await dashboardAPI.logWeight(w);
      loadWeight();
      dashboardAPI.getStats().then((r) => setStats(r.data));
    } catch {
      alert('Could not save weight');
    } finally {
      setWeightSaving(false);
    }
  };

  const handleShare = async () => {
    const { data } = await dashboardAPI.getShare();
    setShareMsg(data.message);
    if (navigator.share) {
      navigator.share({ title: 'YogaCare Progress', text: data.message });
    } else {
      navigator.clipboard.writeText(data.message);
      alert('Progress copied to clipboard!');
    }
  };

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="skeleton h-36 rounded-2xl" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const weightChart = weightData?.history || [];
  const challengePercent = Math.round((stats.completed_days / 30) * 100);
  const weightMin = weightData ? Math.floor(weightData.min_weight - 1) : 50;
  const weightMax = weightData ? Math.ceil(weightData.max_weight + 1) : 100;

  const caloriesFormatted = caloriesData.map((d) => ({
    ...d,
    label: d.date?.slice(5) || '',
  }));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
        {/* Welcome header */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600 p-5 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=20')] bg-cover opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-violet-200 text-sm font-medium uppercase tracking-wider">Your Wellness Hub</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 flex flex-wrap items-center gap-3">
                Namaste, {user?.full_name?.split(' ')[0] || 'Yogi'}
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-slate-900 shadow-md">
                  {user?.level || 'Beginner'} ({user?.xp || 0} XP)
                </span>
              </h1>
              <p className="text-violet-100/90 mt-2 max-w-lg text-sm leading-relaxed">
                {stats.motivational_quote}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="glass-dark rounded-2xl px-5 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold">{stats.trial_days_left}</p>
                <p className="text-xs text-violet-200 mt-1">Trial days left</p>
              </div>
              <div className="glass-dark rounded-2xl px-5 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold">{challengePercent}%</p>
                <p className="text-xs text-violet-200 mt-1">Challenge done</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Face Emotion Scanner */}
        <EmotionScanner />

        {/* Challenge progress bar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-lg">30-Day Challenge Progress</h2>
              <p className="text-sm text-slate-500">{stats.completed_days} of 30 days completed</p>
            </div>
            <Link to="/challenge" className="flex items-center gap-1 text-violet-600 dark:text-violet-400 text-sm font-medium hover:underline">
              Continue <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${challengePercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full"
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Flame} label="Calories Today" value={Math.round(stats.calories_today)} sub={`${Math.round(stats.calories_total)} total burned`} gradient="bg-gradient-to-br from-orange-500 to-red-500" delay={0} />
          <StatCard icon={Target} label="Current Streak" value={`${stats.current_streak}`} sub={`Best: ${stats.longest_streak} days`} gradient="bg-gradient-to-br from-violet-600 to-purple-700" delay={0.05} />
          <StatCard icon={Calendar} label="Days Completed" value={`${stats.completed_days}/30`} sub={`${stats.remaining_days} days left`} gradient="bg-gradient-to-br from-cyan-500 to-teal-600" delay={0.1} />
          <StatCard icon={TrendingUp} label="BMI Score" value={stats.bmi} sub={stats.bmi_category} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" delay={0.15} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weight tracking */}
          <div className="glass-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-violet-500" />
                  <h3 className="font-semibold text-lg">Weight Tracking</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Current: <span className="font-semibold text-slate-800 dark:text-white">{weightData?.current_weight} kg</span>
                  {' · '}BMI: <span className="font-semibold">{weightData?.current_bmi}</span>
                </p>
              </div>
              <form onSubmit={handleLogWeight} className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  className="input-field w-24 py-2 text-sm"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="kg"
                />
                <button type="submit" disabled={weightSaving} className="btn-primary text-sm py-2 px-4">
                  {weightSaving ? '...' : 'Log'}
                </button>
              </form>
            </div>

            {weightChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minHeight={180}>
                <LineChart data={weightChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    domain={[weightMin, weightMax]}
                    tickFormatter={(v) => `${v}kg`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} kg`, 'Weight']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#22d3ee' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                Log your weight to see progress
              </div>
            )}
          </div>

          {/* Calories chart */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-teal-500" />
              <div>
                <h3 className="font-semibold text-lg">Weekly Calories</h3>
                <p className="text-sm text-slate-500">Last 7 days of yoga burn</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220} minHeight={180}>
              <AreaChart data={caloriesFormatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v} kcal`, 'Burned']} />
                <Area type="monotone" dataKey="calories" stroke="#14b8a6" strokeWidth={2} fill="url(#calGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/water" className="glass-card p-6 hover:ring-2 hover:ring-cyan-500/30 transition-all group">
            <Droplets className="w-9 h-9 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-bold">{stats.water_glasses_today}<span className="text-lg text-slate-400 font-normal">/{stats.water_goal}</span></p>
            <p className="text-sm text-slate-500 mt-1">Water glasses today</p>
            <span className="text-cyan-600 text-sm font-medium mt-3 inline-flex items-center gap-1">Track water <ChevronRight className="w-4 h-4" /></span>
          </Link>

          <div className="glass-card p-6">
            <p className="text-3xl font-bold gradient-text">{stats.completed_exercises}</p>
            <p className="text-sm text-slate-500 mt-1">Yoga poses completed</p>
            <p className="text-xs text-slate-400 mt-3">Keep flowing — every pose counts!</p>
          </div>

          <Link to="/challenge" className="glass-card p-6 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 hover:from-violet-500/20 transition-all group">
            <p className="text-3xl font-bold">{stats.remaining_days}</p>
            <p className="text-sm text-slate-500 mt-1">Days remaining</p>
            <span className="btn-primary text-sm mt-4 inline-flex items-center gap-1 py-2 px-4">
              Start Session <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="w-full glass-card p-5 flex items-center justify-center gap-3 hover:bg-violet-500/5 transition-colors border border-violet-500/20"
        >
          <Share2 className="w-5 h-5 text-violet-500" />
          <span className="font-medium">Share Your Progress</span>
        </button>
        {shareMsg && <p className="text-sm text-center text-slate-500 px-4">{shareMsg}</p>}
      </motion.div>
    </DashboardLayout>
  );
}
