import { useState } from 'react';
import { adminLogin, setToken } from '../../services/adminApi';
import { useLocation, useNavigate } from 'react-router-dom';

type LoginResponse = {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role?: string;
    };
};

type LocationState = { from?: string };

export default function AdminLogin() {
    const [email, setEmail] = useState('admin@pixelretro.dev');
    const [password, setPassword] = useState('Admin123!');
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
            const res = (await adminLogin(email, password)) as LoginResponse;
            setToken(res.token);
            nav(from);
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error de login');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Ingresar al panel</h2>
            <form onSubmit={submit} className="grid gap-3">
                <input
                    className="border rounded-xl px-3 py-2"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                />
                <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={busy}>
                    {busy ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
            {msg && <p className="text-red-600 mt-3">{msg}</p>}
        </div>
    );
}
