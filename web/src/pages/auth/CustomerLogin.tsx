import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

type LocationState = { next?: string };

export default function CustomerLogin() {
    const { login } = useCustomerAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const nav = useNavigate();
    const loc = useLocation();
    const next = (loc.state as LocationState | null)?.next ?? '/';

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setBusy(true);
            setMsg(null);
            const u = await login(email, password);
            if (u.must_change_password) {
                nav('/account/change-password', { replace: true });
            } else {
                nav(next, { replace: true });
            }
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error de login');
        } finally {
            setBusy(false);
        }
    };

    const onEmail = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const onPassword = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[420px] max-w-full rounded-[22px] p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                <h1 className="text-center text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Iniciar sesión
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">Accede a tu cuenta para continuar</p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">Email</span>
                    <input
                        id="email"
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={onEmail}
                        autoComplete="email"
                    />

                    <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">Contraseña</span>
                    <input
                        id="password"
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={onPassword}
                        autoComplete="current-password"
                    />

                    <div className="flex items-center justify-between text-sm">
                        <span />
                        <Link to="/forgot-password" className="text-[#06B6D4] hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={busy || !email || !password}
                    >
                        {busy ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}

                <p className="mt-4 text-sm text-white/80 text-center">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-[#06B6D4] hover:underline">Crear cuenta</Link>
                </p>
            </div>
        </div>
    );
}
