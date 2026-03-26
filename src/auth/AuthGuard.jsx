import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AuthGuard = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
