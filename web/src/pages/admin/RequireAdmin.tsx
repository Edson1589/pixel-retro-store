import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../../services/adminApi';
import { getAdminUser } from '../../services/adminApi';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const token = getToken();
    const loc = useLocation();

    if (!token) {
        return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
    }

    const u = getAdminUser();
    if (u?.must_change_password && loc.pathname !== '/admin/change-password') {
        return <Navigate to="/admin/change-password" replace />;
    }

    return <>{children}</>;
}
