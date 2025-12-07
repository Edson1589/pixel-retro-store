import {
    Outlet,
    useNavigate,
    useLocation,
    NavLink,
} from 'react-router-dom';
import { adminLogout, getToken } from '../../services/adminApi';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Menu,
    X,
    Users,
    CalendarCheck2,
    ClipboardList,
    PackageSearch,
    Tag,
    ShoppingBag,
    KeyRound,
    LogOut,
    UserCircle2,
    ChevronDown,
} from 'lucide-react';

export default function AdminLayout() {
    const nav = useNavigate();
    const loc = useLocation();
    const [busy, setBusy] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        const stored = window.localStorage.getItem('adminSidebarOpen');
        if (stored === '0') return false;
        return true;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem('adminSidebarOpen', sidebarOpen ? '1' : '0');
    }, [sidebarOpen]);

    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const isLogged = !!getToken();

    const logout = async () => {
        try {
            setBusy(true);
            await adminLogout();
            nav('/admin/login');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        setUserMenuOpen(false);
    }, [loc.pathname]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (userMenuRef.current && !userMenuRef.current.contains(t)) {
                setUserMenuOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const sidebarLinkBase =
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium';
    const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
        isActive
            ? `${sidebarLinkBase} bg-white/10 text-white`
            : `${sidebarLinkBase} text-white/70 hover:bg-white/5 hover:text-white`;

    return (
        <div className="relative min-h-screen bg-[#07101B] text-white">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]
                bg-[radial-gradient(#ffffff_1px,transparent_1.2px)] [background-size:16px_16px]
                [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
            />
            <div className="pointer-events-none absolute -z-10 top-1/2 left-1/2 h-[720px] w-[720px]
                -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl
                bg-[radial-gradient(closest-side,rgba(124,58,237,0.28),transparent_70%)]"
            />
            <div className="pointer-events-none absolute -z-10 top-10 right-16 h-[380px] w-[380px]
                rounded-full blur-3xl
                bg-[radial-gradient(closest-side,rgba(6,182,212,0.18),transparent_70%)]"
            />

            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050814]/95 backdrop-blur">
                <div className="h-14 px-4 lg:px-8 flex items-center gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md
                         bg-white/10 hover:bg-white/15 outline-none"
                        aria-label="Abrir menú"
                        onClick={() => setSidebarOpen(v => !v)}
                    >
                        {sidebarOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Menu className="h-4 w-4" />
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-7 w-7 rounded-[4px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5 7h4V5h6v2h4v6h-2v4h-4v-2h-4v2H7v-4H5z"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>
                        <span className="text-sm">
                            <strong>Admin · Pixel Retro</strong>
                        </span>
                    </div>

                    {isLogged && (
                        <div ref={userMenuRef} className="ml-auto relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen((v) => !v)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
                                           bg-white/5 border border-white/10 text-sm text-white/90
                                           hover:bg-white/10 transition"
                            >
                                <UserCircle2 className="h-5 w-5" />
                                <span className="hidden sm:inline">Hola, admin</span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {userMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-64
                                               rounded-2xl border border-white/10
                                               bg-[#07101B]
                                               shadow-[0_18px_50px_-22px_rgba(15,23,42,1)]
                                               z-50"
                                >
                                    <div className="px-4 py-3 border-b border-white/5 text-xs uppercase tracking-[0.16em] text-white/50">
                                        Hola, <span className="text-white font-semibold">admin</span>
                                    </div>
                                    <nav className="py-1 text-sm text-white/90">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                nav('/admin/change-password');
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-left"
                                        >
                                            <KeyRound className="h-4 w-4" />
                                            <span>Cambiar contraseña</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-red-300 hover:bg-red-500/10 text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>{busy ? 'Cerrando…' : 'Cerrar sesión'}</span>
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="flex">
                <aside
                    className={`
            fixed top-14 bottom-0 left-0 z-30
            w-60 bg-[#050814]/98 border-r border-white/10
            transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
                >
                    <div className="h-full flex flex-col gap-4 px-3 pb-6 pt-4 overflow-y-auto">
                        <div className="text-xs text-white/50 uppercase tracking-[0.16em] px-2 pt-2">
                            Navegación
                        </div>
                        <nav className="space-y-1">
                            <NavLink to="/admin/users" className={sidebarLinkClass}>
                                <Users className="h-4 w-4" />
                                <span>Usuarios</span>
                            </NavLink>
                            <NavLink to="/admin/events" end className={sidebarLinkClass}>
                                <CalendarCheck2 className="h-4 w-4" />
                                <span>Eventos</span>
                            </NavLink>
                            <NavLink to="/admin/appointments" className={sidebarLinkClass}>
                                <ClipboardList className="h-4 w-4" />
                                <span>Citas</span>
                            </NavLink>
                            <NavLink to="/admin/events/onsite" className={sidebarLinkClass}>
                                <ClipboardList className="h-4 w-4" />
                                <span>Registro de participantes</span>
                            </NavLink>
                            <NavLink to="/admin/products" className={sidebarLinkClass}>
                                <PackageSearch className="h-4 w-4" />
                                <span>Productos</span>
                            </NavLink>
                            <NavLink to="/admin/categories" className={sidebarLinkClass}>
                                <Tag className="h-4 w-4" />
                                <span>Categorías</span>
                            </NavLink>
                            <NavLink to="/admin/sales" className={sidebarLinkClass}>
                                <ShoppingBag className="h-4 w-4" />
                                <span>Ventas</span>
                            </NavLink>
                            <NavLink to="/admin/pos/sale" className={sidebarLinkClass}>
                                <ShoppingBag className="h-4 w-4" />
                                <span>Realizar venta</span>
                            </NavLink>
                        </nav>
                    </div>
                </aside>

                <main
                    className={`
            flex-1 min-h-[calc(100vh-3.5rem)]
            px-4 lg:px-8 pb-6 pt-4
            transition-all duration-200
            ${sidebarOpen ? 'ml-60' : 'ml-0'}
        `}
                >
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>
    );
}

