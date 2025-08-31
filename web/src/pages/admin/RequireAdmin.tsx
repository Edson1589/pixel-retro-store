import { getToken } from '../../services/adminApi';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const token = getToken();
    const loc = useLocation();
    if (!token) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
    return <>{children}</>;
}
