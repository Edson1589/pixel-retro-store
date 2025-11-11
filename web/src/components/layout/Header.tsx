import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import TopBar from '../TopBar';

export default function Header() {
    const { user, loading, logout } = useCustomerAuth();
    const { items } = useCart();
    const loc = useLocation();
    const nav = useNavigate();

    if (loc.pathname.startsWith('/admin')) return null;

    const qty = items.reduce((a, b) => a + b.quantity, 0);

    const doLogout = async () => {
        await logout();
        if (loc.pathname.startsWith('/cart')) nav('/');
    };

    return (
        <TopBar
            left={
                <Link to="/" className="flex items-center gap-2 font-semibold tracking-wide">
                    <span className="grid place-items-center h-5 w-5 rounded-[3px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 7h4V5h6v2h4v6h-2v4h-4v-2h-4v2H7v-4H5z" fill="currentColor" />
                        </svg>
                    </span>
                    <span className="text-sm"><strong>Pixel Retro</strong></span>
                </Link>
            }
            items={[
                { label: 'Productos', to: '/' },
                { label: 'Eventos', to: '/events' },

                ...(user ? [
                    { label: 'Mis compras', to: '/account/orders' },
                    { label: 'Citas', to: '/account/appointments' },
                    { label: 'Cambiar contraseña', to: '/account/change-password' },
                ] : []),

                { label: 'Carrito', to: '/cart', badge: qty },

                ...(!loading
                    ? (user
                        ? [
                            { label: `Hola, ${user.name}` },
                            { label: 'Salir', onClick: doLogout },
                        ]
                        : [
                            { label: 'Ingresar', to: '/login' },
                            { label: 'Crear cuenta', to: '/register' },
                        ])
                    : []),
            ]}

        />
    );
}
