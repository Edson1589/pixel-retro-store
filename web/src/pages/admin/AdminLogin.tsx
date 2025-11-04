import { useState } from 'react';
import { adminLogin, setToken, setAdminUser } from '../../services/adminApi';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AdminLoginResponse } from '../../types';

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
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[420px] max-w-full rounded-[22px] p-6
                      bg-white/[0.04] border border-white/10 backdrop-blur-xl
                      shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">

                <h1 className="text-center text-2xl font-extrabold
                       bg-clip-text text-transparent
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Acceso Admin
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">
                    Panel administrativo
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        id="email"
                        className="w-full rounded-xl px-3 py-2
                       bg-white/[0.05] text-white/90 placeholder:text-white/45
                       border border-white/10
                       focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        autoFocus
                    />

                    <label htmlFor="password" className="sr-only">Contraseña</label>
                    <input
                        id="password"
                        className="w-full rounded-xl px-3 py-2
                       bg-white/[0.05] text-white/90 placeholder:text-white/45
                       border border-white/10
                       focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />

                    <button
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={busy || !email || !password}
                    >
                        {busy ? 'Ingresando...' : 'Ingresar'}
                    </button>
                    <div className="mt-3 text-center">
                        <a href="/admin/forgot-password" className="text-cyan-300 hover:underline text-sm">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                </form>

                {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
            </div>
        </div>
    );
}
