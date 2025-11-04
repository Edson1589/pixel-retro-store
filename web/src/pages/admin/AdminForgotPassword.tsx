import { useState } from 'react';
import { adminForgotPassword } from '../../services/adminApi';
import { Link } from 'react-router-dom';

export default function AdminForgotPassword() {
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const can = email.trim().length > 0;

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        try {
            const r = await adminForgotPassword(email.trim());
            setMsg(r.message);
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'No se pudo procesar la solicitud.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[420px] max-w-full rounded-[22px] p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                <h1 className="text-center text-2xl font-extrabold bg-clip-text text-transparent
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Recuperar acceso
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">
                    Ingresa tu correo (admin / técnico / vendedor).
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        id="email"
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90
                       placeholder:text-white/45 border border-white/10
                       focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="email"
                        placeholder="email@dominio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />
                    <button
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                       hover:brightness-110 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!can || busy}
                    >
                        {busy ? 'Enviando…' : 'Enviar contraseña temporal'}
                    </button>
                </form>

                {msg && <p className="mt-3 text-sm text-emerald-300">{msg}</p>}

                <div className="mt-4 text-center">
                    <Link to="/admin/login" className="text-cyan-300 hover:underline text-sm">
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
}
