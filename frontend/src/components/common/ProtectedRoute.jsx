import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useSelector((s) => s.auth);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !user?.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
}
