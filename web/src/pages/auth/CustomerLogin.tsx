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
            await login(email, password);
            nav(next, { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error de login');
        } finally {
            setBusy(false);
        }
    };

    const onEmail = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const onPassword = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    return (
        <div className="max-w-sm mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>
            <form onSubmit={submit} className="grid gap-3">
                <input
                    className="border rounded-xl px-3 py-2"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={onEmail}
                    autoComplete="email"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={onPassword}
                    autoComplete="current-password"
                />
                <button
                    className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                    disabled={busy || !email || !password}
                >
                    {busy ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
            {msg && <p className="text-red-600 mt-3">{msg}</p>}
            <p className="mt-3 text-sm">
                ¿No tienes cuenta? <Link to="/register" className="underline">Crear cuenta</Link>
            </p>
        </div>
    );
}
