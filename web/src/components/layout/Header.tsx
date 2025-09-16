import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';

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
        <header className="border-b">
            <div className="max-w-6xl mx-auto p-3 flex items-center gap-3">
                <Link to="/" className="font-bold">Pixel Retro Store</Link>
                <nav className="ml-auto flex items-center gap-3 text-sm">
                    <Link to="/events" className="underline">Eventos</Link>
                    {user && <Link to="/account/orders" className="px-3 py-2 rounded-xl border">Mis compras</Link>}

                    <Link to="/cart" className="underline relative">
                        Carrito
                        {qty > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center text-xs px-1.5 rounded-full bg-black text-white">
                                {qty}
                            </span>
                        )}
                    </Link>

                    {!loading && (user ? (
                        <>
                            <span className="hidden sm:inline">Hola, {user.name}</span>
                            <button onClick={doLogout} className="underline">Salir</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="underline">Ingresar</Link>
                            <Link to="/register" className="underline">Crear cuenta</Link>
                        </>
                    ))}
                </nav>
            </div>
        </header>
    );
}
