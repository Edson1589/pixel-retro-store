import { Link, useLocation } from 'react-router-dom';
import {
    Gamepad2,
    Sparkles,
    ShoppingBag,
    Mail,
    MapPin,
    Instagram,
    Facebook,
    Github,
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function Footer() {
    const { user } = useCustomerAuth();
    const loc = useLocation();

    if (loc.pathname.startsWith('/admin')) return null;

    const year = new Date().getFullYear();

    return (
        <footer className="mt-16 border-t border-white/5 bg-[#050814] text-white/80">
            <div className="h-[2px] w-full bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] opacity-70" />

            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 space-y-10">
                <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <span className="grid place-items-center h-8 w-8 rounded-[5px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                                <Gamepad2 className="h-4 w-4" />
                            </span>
                            <div className="leading-tight">
                                <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                                    Pixel Retro Store
                                </p>
                                <p className="text-sm font-semibold">Donde vive la nostalgia gamer</p>
                            </div>
                        </div>

                        <p className="text-sm text-white/70 max-w-md">
                            Consolas clásicas, cartuchos originales, accesorios y coleccionables
                            para que tu lado retro siga en modo <span className="text-white">ON</span>.
                        </p>

                        <div className="flex flex-wrap gap-2 text-[11px]">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Clásicos restaurados
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" />
                                Compras seguras
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                                <Gamepad2 className="h-3 w-3" />
                                Comunidad retro
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                            Tienda
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-white transition-colors"
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/events"
                                    className="hover:text-white transition-colors"
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    Eventos y torneos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3 text-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                            Tu cuenta
                        </h3>
                        <ul className="space-y-2">
                            {user ? (
                                <>
                                    <li>
                                        <Link
                                            to="/account/orders"
                                            className="hover:text-white transition-colors"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            Mis compras
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/account/appointments"
                                            className="hover:text-white transition-colors"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            Citas agendadas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/account/change-password"
                                            className="hover:text-white transition-colors"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            Cambiar contraseña
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link
                                            to="/login"
                                            className="hover:text-white transition-colors"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            Iniciar sesión
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/register"
                                            className="hover:text-white transition-colors"
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            Crear cuenta
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-3 text-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                            Soporte & comunidad
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-white/60" />
                                <span>soporte@pixelretro.store</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-white/60" />
                                <span>Cochabamba · Bolivia</span>
                            </li>
                        </ul>

                        <div className="pt-2 space-y-2">
                            <p className="text-xs text-white/55">Síguenos:</p>
                            <div className="flex items-center gap-3">
                                <a
                                    href="#"
                                    aria-label="Instagram"
                                    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10 transition"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                                <a
                                    href="#"
                                    aria-label="Facebook"
                                    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10 transition"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a
                                    href="#"
                                    aria-label="GitHub"
                                    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10 transition"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-white/50">
                    <p>
                        © {year} Pixel Retro Store. Todos los derechos reservados.
                    </p>
                    <p className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>Construido con cariño gamer en UNIVALLE.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
