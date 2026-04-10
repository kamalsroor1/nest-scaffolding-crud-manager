import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guard component for routes requiring authentication.
 * Redirects to /login if no access token is found.
 */
const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
