import { useState } from 'react';
import { adminChangePassword, getAdminUser, setAdminUser } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';
import {
    LockKeyhole,
    KeyRound,
    ShieldCheck,
    Save,
} from 'lucide-react';

export default function AdminChangePassword() {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();

    const strong = (v: string) =>
        v.length >= 8 &&
        /[a-z]/.test(v) &&
        /[A-Z]/.test(v) &&
        /[0-9]/.test(v) &&
        /[^A-Za-z0-9]/.test(v);

    const can = current.length > 0 && strong(next) && next === confirm && !busy;

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsg(null);
        try {
            setBusy(true);
            await adminChangePassword({
                current_password: current,
                new_password: next,
                new_password_confirmation: confirm,
            });
            const u = getAdminUser();
            if (u) { u.must_change_password = false; setAdminUser(u); }
            nav('/admin', { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña');
        } finally {
            setBusy(false);
        }
    };

    const strongRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const isStrong = !next || strongRegex.test(next);
    const match = !next || !confirm || next === confirm;

    return (
        <div className="min-h-screen place-items-center bg-[#07101B] px-3 sm:px-4 py-6 sm:py-10">
            <div className="w-full max-w-[520px] rounded-2xl sm:rounded-[22px] p-4 sm:p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] text-white">
                <h1 className="text-center text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Cambiar contraseña
                </h1>
                <p className="mt-1 text-center text-white/70 text-xs sm:text-sm">
                    Debes actualizar tu contraseña para continuar.
                </p>

                <form
                    onSubmit={submit}
                    className="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3"
                >
                    {/* Contraseña actual */}
                    <div className="flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#7C3AED66]">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <LockKeyhole className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            className="flex-1 px-3 py-2.5 sm:py-2 text-[15px] sm:text-base bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="password"
                            placeholder="Contraseña actual"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Nueva contraseña */}
                    <div
                        className={`flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#7C3AED66]
          ${next && !isStrong ? ' ring-2 ring-red-500 focus-within:ring-red-500' : ''}`}
                    >
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <KeyRound className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            className="flex-1 px-3 py-2.5 sm:py-2 text-[15px] sm:text-base bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="password"
                            placeholder="Nueva contraseña"
                            value={next}
                            onChange={(e) => setNext(e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!next && !isStrong}
                        />
                    </div>

                    {/* Confirmar nueva contraseña */}
                    <div className="flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#7C3AED66]">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <ShieldCheck className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            className="flex-1 px-3 py-2.5 sm:py-2 text-[15px] sm:text-base bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            type="password"
                            placeholder="Confirmar nueva contraseña"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!confirm && !match}
                        />
                    </div>

                    <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                        Requisitos: 8+ caracteres, 1 minúscula, 1 mayúscula, 1 número y 1
                        símbolo.
                    </p>

                    {!match && (next || confirm) && (
                        <p className="text-[11px] sm:text-xs text-amber-300/90">
                            Las contraseñas no coinciden.
                        </p>
                    )}

                    {!isStrong && next && (
                        <p className="text-[11px] sm:text-xs text-amber-300/90">
                            La nueva contraseña no cumple los requisitos de seguridad.
                        </p>
                    )}

                    <button
                        disabled={!can}
                        className="mt-1 w-full px-4 py-2.5 sm:py-2 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        <span>{busy ? 'Guardando...' : 'Guardar nueva contraseña'}</span>
                    </button>

                    {msg && (
                        <p className="mt-2 text-sm text-red-400" aria-live="polite">
                            {msg}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );

}
