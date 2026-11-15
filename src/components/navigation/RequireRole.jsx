import { Navigate, useLocation } from 'react-router-dom';
import dashboardPath from '../../utils/dashboardPath';
import { useAuth } from '../../contexts/AuthContext';

export default function RequireRole({ roles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to={dashboardPath(role)} replace />;
  }
  return children;
}
