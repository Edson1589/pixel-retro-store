import { Navigate, useLocation } from 'react-router-dom';
import { getAdminUser } from '../../services/adminApi';

export default function RequireStaff({ children }: { children: React.ReactNode }) {
    const u = getAdminUser();
    const loc = useLocation();
    if (!u) return <Navigate to="/admin/login" replace state={{ next: loc.pathname + loc.search }} />;
    if (u.role !== 'admin' && u.role !== 'technician') return <Navigate to="/admin/login" replace />;
    return <>{children}</>;
}
