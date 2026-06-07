import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute() {
  const { isConnected, isLoading } = useAuth();

  if (!isConnected && !isLoading) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return null;
  }

  return <Outlet />;
}
