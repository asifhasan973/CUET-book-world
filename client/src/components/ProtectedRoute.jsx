import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, dbUser, loading } = useAuth();

  if (loading) return <Spinner size="lg" />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && dbUser && !allowedRoles.includes(dbUser.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
