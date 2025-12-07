import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { customerForgotPassword } from '../../services/customerApi';
import { Mail, MailCheck } from 'lucide-react';

export default function CustomerForgotPassword() {
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setBusy(true);
            setMsg(null);
            await customerForgotPassword(email.trim());
            setOk(true);
            setMsg('Si el correo es válido, te enviamos una contraseña temporal.');
        } catch {
            setOk(true);
            setMsg('Si el correo es válido, te enviamos una contraseña temporal.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen place-items-center bg-[#07101B] p-4">
            <div className="w-[420px] max-w-full rounded-[22px] p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                <h1 className="text-center text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">Ingresa tu email y te enviaremos una contraseña temporal.</p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <label htmlFor="email" className="sr-only">
                        Email
                    </label>
                    <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Email
                    </span>
                    <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/15 overflow-hidden
    focus-within:ring-2 focus-within:ring-[#7C3AED66]
">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <Mail className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            id="email"
                            className="flex-1 px-3 py-2 bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>


                    <button
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium
    bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
    hover:brightness-110 transition disabled:opacity-50
    inline-flex items-center justify-center gap-2
  "
                        disabled={busy || !email}
                    >
                        <MailCheck className="h-4 w-4" />
                        <span>{busy ? 'Enviando...' : 'Enviar contraseña temporal'}</span>
                    </button>

                </form>

                {msg && (
                    <p className={`mt-3 text-sm ${ok ? 'text-emerald-300' : 'text-red-400'}`} aria-live="polite">
                        {msg}
                    </p>
                )}

                <p className="mt-4 text-sm text-white/80 text-center">
                    <Link to="/login" className="text-[#06B6D4] hover:underline">Volver a iniciar sesión</Link>
                </p>
            </div>
        </div>
    );
}
