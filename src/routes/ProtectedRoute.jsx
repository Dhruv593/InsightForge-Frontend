import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import { Seo } from '../components/common/Seo';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><Spinner label="Restoring your session…" /></div>;
  }
  return isAuthenticated ? <><Seo title="Tatparya workspace" description="Your private Tatparya workspace." path={location.pathname} noIndex /><Outlet /></> : <Navigate to="/login" replace state={{ from: location }} />;
}
