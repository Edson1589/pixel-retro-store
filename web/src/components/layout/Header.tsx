// src/components/layout/Header.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import {
    ShoppingCart,
    UserCircle2,
    LogIn,
    UserPlus,
    LogOut,
    PackageSearch,
    CalendarCheck2,
    KeyRound,
    ChevronDown,
    ListTree,
} from 'lucide-react';
import CategoryDropdown from '../CategoryDropdown';

export default function Header() {
    const { user, loading, logout } = useCustomerAuth();
    const { items } = useCart();
    const loc = useLocation();
    const nav = useNavigate();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [catsOpen, setCatsOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const catsRef = useRef<HTMLDivElement | null>(null);

    const isAdminRoute = loc.pathname.startsWith('/admin');

    // Cerrar menús al cambiar de ruta (hook SIEMPRE se ejecuta)
    useEffect(() => {
        setUserMenuOpen(false);
        setCatsOpen(false);
    }, [loc.pathname]);

    // Cerrar con click fuera + ESC (hook SIEMPRE se ejecuta)
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (userMenuRef.current && !userMenuRef.current.contains(target)) {
                setUserMenuOpen(false);
            }
            if (catsRef.current && !catsRef.current.contains(target)) {
                setCatsOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setUserMenuOpen(false);
                setCatsOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    // AHORA recién hacemos el early return
    if (isAdminRoute) return null;

    if (loc.pathname.startsWith('/admin')) return null;

    const qty = items.reduce((a, b) => a + b.quantity, 0);
    const firstName = user?.name?.split(' ')[0] ?? 'user';

    const handleLogout = async () => {
        setUserMenuOpen(false);
        await logout();
        if (loc.pathname.startsWith('/cart')) nav('/');
    };

    const navLink = (to: string) => {
        const active = loc.pathname === to || (to === '/' && loc.pathname === '');
        const base =
            'text-sm font-medium px-3 py-1.5 rounded-xl border border-transparent transition-colors';
        return active
            ? `${base} bg-white/10 text-white border-white/15`
            : `${base} text-white/80 hover:bg-white/5 hover:text-white`;
    };
    return (
        <header className="sticky top-0 z-40 bg-[#050814]/95 backdrop-blur">
            {/* Barra superior: logo + carrito + login / menú usuario */}
            <div className="border-b border-white/10">
                <div className="h-14 px-4 lg:px-8 flex items-center gap-4">
                    {/* LOGO */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-semibold tracking-wide text-white"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <span className="grid place-items-center h-7 w-7 rounded-[4px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M5 7h4V5h6v2h4v6h-2v4h-4v-2h-4v2H7v-4H5z"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>
                        <span className="text-sm">
                            <strong>Pixel Retro</strong>
                        </span>
                    </Link>

                    {/* Lado derecho */}
                    <div className="ml-auto flex items-center gap-4">
                        {/* Carrito */}
                        <Link
                            to="/cart"
                            className="relative inline-flex items-center gap-1 text-sm text-white/90 hover:text-white"
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="hidden sm:inline">Carrito</span>
                            {qty > 0 && (
                                <span
                                    className="
                    absolute -right-2 -top-2 min-w-5 h-5 px-1
                    rounded-full grid place-items-center text-[10px]
                    bg-black/85 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)]
                  "
                                >
                                    {qty > 99 ? '99+' : qty}
                                </span>
                            )}
                        </Link>

                        {/* Login / Menú usuario */}
                        {!loading && (
                            <>
                                {user ? (
                                    <div ref={userMenuRef} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setUserMenuOpen((v) => !v)}
                                            className="
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
                        bg-white/5 border border-white/10 text-sm text-white/90
                        hover:bg-white/10 transition
                      "
                                        >
                                            <UserCircle2 className="h-5 w-5" />
                                            <span className="hidden sm:inline">Hola, {firstName}</span>
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {/* Dropdown de usuario */}
                                        {userMenuOpen && (
                                            <div
                                                className="
          absolute right-0 mt-2 w-64
          rounded-2xl border border-white/10
          bg-[#07101B]
          shadow-[0_18px_50px_-22px_rgba(15,23,42,1)]
          z-50
        "
                                            >

                                                <div className="px-4 py-3 border-b border-white/5 text-xs uppercase tracking-[0.16em] text-white/50">
                                                    Hola,{' '}
                                                    <span className="text-white font-semibold">{user.name}</span>
                                                </div>
                                                <nav className="py-1 text-sm text-white/90">
                                                    <Link
                                                        to="/account/orders"
                                                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5"
                                                        onClick={() => {
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <PackageSearch className="h-4 w-4" />
                                                        <span>Mis compras</span>
                                                    </Link>
                                                    <Link
                                                        to="/account/appointments"
                                                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5"
                                                        onClick={() => {
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <CalendarCheck2 className="h-4 w-4" />
                                                        <span>Citas</span>
                                                    </Link>
                                                    <Link
                                                        to="/account/change-password"
                                                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5"
                                                        onClick={() => {
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <KeyRound className="h-4 w-4" />
                                                        <span>Cambiar contraseña</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-red-300 hover:bg-red-500/10"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>Cerrar sesión</span>
                                                    </button>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Link
                                            to="/login"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="
        inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
        bg-white/5 border border-white/10 hover:bg-white/10
        text-xs sm:text-sm
    "
                                        >
                                            <LogIn className="h-4 w-4" />
                                            <span>Iniciar sesión</span>
                                        </Link>
                                        <span className="text-white/40">/</span>
                                        <Link
                                            to="/register"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="inline-flex items-center gap-1 text-xs sm:text-sm hover:text-white"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            <span>Registrarse</span>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Barra inferior: Todas las categorías / Productos / Eventos */}
            <div className="border-b border-white/10 bg-[#050814]">
                <div className="h-11 px-4 lg:px-8 flex items-center gap-4">
                    {/* Todas las categorías + dropdown de categorías */}
                    <div ref={catsRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setCatsOpen((v) => !v)}
                            className="
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-xl
        bg-white/[0.03] border border-white/10
        text-xs sm:text-sm font-medium text-white/90
        hover:bg-white/10 transition
        max-w-[60vw] sm:max-w-none
    "
                        >


                            <ListTree className="h-4 w-4" />
                            <span>Todas las categorías</span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${catsOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {catsOpen && <CategoryDropdown onClose={() => setCatsOpen(false)} />}
                    </div>

                    {/* Links Productos / Eventos */}
                    <nav className="flex items-center gap-2">
                        <Link to="/" className={navLink('/')}>
                            Productos
                        </Link>
                        <Link to="/events" className={navLink('/events')}>
                            Eventos
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
