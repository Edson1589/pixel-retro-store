import { useState } from 'react';
import { adminForgotPassword } from '../../services/adminApi';
import { Link } from 'react-router-dom';
import {
    KeyRound,
    Mail,
    Send,
} from 'lucide-react';

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
        <div className="min-h-screen grid place-items-center bg-[#07101B] px-3 sm:px-4 py-6 sm:py-10">
            <div className="w-full max-w-[480px] rounded-2xl sm:rounded-[22px] p-4 sm:p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] text-white">
                {/* Header con icono */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-11 w-11 rounded-2xl bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)] shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)] grid place-items-center">
                        <KeyRound className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-center text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                        Recuperar acceso
                    </h1>
                    <p className="mt-1 text-center text-white/70 text-xs sm:text-sm">
                        Ingresa tu correo (admin / técnico / vendedor).
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3"
                >
                    {/* Email con icono */}
                    <div className="flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#7C3AED66]">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <Mail className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            id="email"
                            className="flex-1 px-3 py-2.5 sm:py-2 text-[15px] sm:text-base bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="email"
                            placeholder="email@dominio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Botón */}
                    <button
                        className="mt-1 w-full px-4 py-2.5 sm:py-2 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        disabled={!can || busy}
                    >
                        <Send className="h-4 w-4" />
                        <span>{busy ? 'Enviando…' : 'Enviar contraseña temporal'}</span>
                    </button>
                </form>

                {msg && (
                    <p className="mt-3 text-sm text-emerald-300 text-center" aria-live="polite">
                        {msg}
                    </p>
                )}

                <div className="mt-4 text-center">
                    <Link
                        to="/admin/login"
                        className="text-cyan-300 hover:underline text-sm"
                    >
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );

}
