import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dashboardAPI, userAPI } from '../api/services';
import { setTheme } from '../store/themeSlice';
import { fetchUser } from '../store/authSlice';

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const darkMode = useSelector((s) => s.theme.darkMode);
  const dispatch = useDispatch();
  
  const [reminder, setReminder] = useState({
    reminder_time: user?.reminder_time || '07:00',
    is_enabled: user?.daily_reminder_enabled ?? true,
  });
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    height_cm: user?.height_cm || '',
    weight_kg: user?.weight_kg || '',
    fitness_goal: user?.fitness_goal || 'full_body',
    experience_level: user?.experience_level || 'beginner',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setReminder({
        reminder_time: user.reminder_time || '07:00',
        is_enabled: user.daily_reminder_enabled ?? true,
      });
      setProfile({
        full_name: user.full_name || '',
        height_cm: user.height_cm || '',
        weight_kg: user.weight_kg || '',
        fitness_goal: user.fitness_goal || 'full_body',
        experience_level: user.experience_level || 'beginner',
      });
    }
  }, [user]);

  const saveReminder = async () => {
    await dashboardAPI.updateReminder(reminder);
    dispatch(fetchUser());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await userAPI.updateProfile({
        full_name: profile.full_name,
        height_cm: Number(profile.height_cm),
        weight_kg: Number(profile.weight_kg),
        fitness_goal: profile.fitness_goal,
        experience_level: profile.experience_level,
      });
      await dispatch(fetchUser());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      alert('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleDark = () => {
    dispatch(setTheme(!darkMode));
    userAPI.updateProfile({ dark_mode: !darkMode }).catch(() => {});
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <form onSubmit={saveProfile} className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-slate-200/50 dark:border-slate-800 pb-2">Edit Profile</h3>
          
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Height (cm)</label>
              <input
                type="number"
                className="input-field"
                value={profile.height_cm}
                onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={profile.weight_kg}
                onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Fitness Goal</label>
            <select
              className="input-field"
              value={profile.fitness_goal}
              onChange={(e) => setProfile({ ...profile, fitness_goal: e.target.value })}
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="flexibility">Flexibility</option>
              <option value="meditation">Meditation</option>
              <option value="strength">Strength</option>
              <option value="belly_fat">Belly Fat Reduction</option>
              <option value="full_body">Full Body Fitness</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Experience Level</label>
            <select
              className="input-field"
              value={profile.experience_level}
              onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="pt-2 text-xs text-slate-400">
            Current calculated BMI: <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.bmi}</span>
          </div>

          <button type="submit" disabled={profileSaving} className="btn-primary w-full">
            {profileSaving ? 'Saving...' : profileSaved ? 'Saved Profile!' : 'Save Profile'}
          </button>
        </form>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-lg border-b border-slate-200/50 dark:border-slate-800 pb-2">Appearance</h3>
          <label className="flex items-center justify-between">
            <span>Dark Mode</span>
            <button onClick={toggleDark} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-violet-600' : 'bg-slate-300'}`}>
              <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-lg border-b border-slate-200/50 dark:border-slate-800 pb-2">Daily Reminder</h3>
          <label className="flex items-center justify-between mb-4">
            <span>Enable reminders</span>
            <input
              type="checkbox"
              checked={reminder.is_enabled}
              onChange={(e) => setReminder({ ...reminder, is_enabled: e.target.checked })}
            />
          </label>
          <input
            type="time"
            className="input-field"
            value={reminder.reminder_time}
            onChange={(e) => setReminder({ ...reminder, reminder_time: e.target.value })}
          />
          <button onClick={saveReminder} className="btn-primary w-full mt-4">
            {saved ? 'Saved Reminder!' : 'Save Reminder'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
