import { Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../i18n/index.jsx';
import dashboardPath from '../../utils/dashboardPath';

// Public storefront gate for the course catalog & details:
// guests and students may enter; any other logged-in role is
// redirected to its own dashboard with a notice.
export default function StudentOrGuest({ children }) {
  const { isAuthenticated, role } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const blocked = isAuthenticated && role !== 'student';
  const notified = useRef(false);
  useEffect(() => {
    if (blocked && !notified.current) {
      notified.current = true;
      toast.warning(t('common.studentsOnly'));
    }
  }, [blocked, toast, t]);
  if (blocked) return <Navigate to={dashboardPath(role)} replace />;
  return children;
}
