import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/authSlice';
import { setTheme } from './store/themeSlice';
import LoadingScreen from './components/common/LoadingScreen';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ChallengePage from './pages/ChallengePage';
import DayDetailPage from './pages/DayDetailPage';
import ExercisePage from './pages/ExercisePage';
import WaterTrackerPage from './pages/WaterTrackerPage';
import MeditationPage from './pages/MeditationPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

// New Pages
import CommunityPage from './pages/CommunityPage';
import ClassesPage from './pages/ClassesPage';
import DietPage from './pages/DietPage';
import SleepPage from './pages/SleepPage';
import FitnessTwinPage from './pages/FitnessTwinPage';

function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const token = localStorage.getItem('yogacare_token') || localStorage.getItem('lotusflow_token');

  useEffect(() => {
    const theme = localStorage.getItem('yogacare_theme') || localStorage.getItem('lotusflow_theme');
    dispatch(setTheme(theme !== 'light'));
  }, [dispatch]);

  useEffect(() => {
    const init = async () => {
      if (token) await dispatch(fetchUser());
      setReady(true);
    };
    init();
  }, [dispatch, token]);

  if (!ready) return <LoadingScreen />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/challenge" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
          <Route path="/challenge/day/:dayNumber" element={<ProtectedRoute><DayDetailPage /></ProtectedRoute>} />
          <Route path="/exercise/:exerciseId" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
          <Route path="/water" element={<ProtectedRoute><WaterTrackerPage /></ProtectedRoute>} />
          <Route path="/meditation" element={<ProtectedRoute><MeditationPage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* New Routes */}
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><DietPage /></ProtectedRoute>} />
          <Route path="/sleep" element={<ProtectedRoute><SleepPage /></ProtectedRoute>} />
          <Route path="/twin" element={<ProtectedRoute><FitnessTwinPage /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}
