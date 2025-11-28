import { useState } from 'react';
import { adminLogin, setToken, setAdminUser } from '../../services/adminApi';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AdminLoginResponse } from '../../types';
import {
    LockKeyhole,
    Mail,
    Shield,
    LogIn,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type LocationState = { from?: string };

export default function AdminLogin() {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('1234');
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const nav = useNavigate();
    const location = useLocation();
    const from = (location.state as LocationState | null)?.from ?? '/admin';

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setBusy(true);
            setMsg(null);
            const res = await adminLogin(email, password) as AdminLoginResponse;
            setToken(res.token);
            setAdminUser({
                id: res.user.id,
                name: res.user.name,
                email: res.user.email,
                role: res.user.role,
                must_change_password: !!res.user.must_change_password,
            });
            if (res.user.must_change_password) {
                nav('/admin/change-password', { replace: true });
            } else {
                nav(from, { replace: true });
            }
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error de login');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] px-3 sm:px-4 py-6 sm:py-10">
            <div className="w-full max-w-[480px] rounded-2xl sm:rounded-[22px] p-4 sm:p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] text-white">
                {/* Header con icono */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-11 w-11 rounded-2xl bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)] shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)] grid place-items-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-center text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                        Acceso Admin
                    </h1>
                    <p className="mt-1 text-center text-white/70 text-xs sm:text-sm">
                        Panel administrativo
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3"
                >
                    {/* Email */}
                    <div className="flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#7C3AED66]">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <Mail className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            id="email"
                            className="flex-1 px-3 py-2.5 sm:py-2 text-[15px] sm:text-base bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#7C3AED66]">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <LockKeyhole className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            id="password"
                            className="flex-1 px-3 py-2.5 sm:py-2 text-[15px] sm:text-base bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Botón login */}
                    <button
                        className="mt-1 w-full px-4 py-2.5 sm:py-2 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        disabled={busy || !email || !password}
                    >
                        <LogIn className="h-4 w-4" />
                        <span>{busy ? 'Ingresando...' : 'Ingresar'}</span>
                    </button>

                    {/* Link recuperar */}
                    <div className="mt-3 text-center">
                        <Link
                            to="/admin/forgot-password"
                            className="text-cyan-300 hover:underline text-sm"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </form>

                {msg && (
                    <p className="mt-3 text-sm text-red-400" aria-live="polite">
                        {msg}
                    </p>
                )}
            </div>
        </div>
    );

}
