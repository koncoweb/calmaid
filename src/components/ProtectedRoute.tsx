import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, currentUser } = useAuth();

  // First check if user is authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && currentUser?.role !== requiredRole) {
    // Redirect admin to admin dashboard, regular users to user dashboard
    return <Navigate to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  // User is authenticated and has required role (or no specific role required)
  return <>{children}</>;
};

export default ProtectedRoute;
