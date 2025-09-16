import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function RequireCustomer({ children }: { children: React.ReactNode }) {
    const { user, loading } = useCustomerAuth();
    const loc = useLocation();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace state={{ next: loc.pathname + loc.search }} />;
    return <>{children}</>;
}
