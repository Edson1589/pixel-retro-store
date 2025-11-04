import { useState } from 'react';
import { adminChangePassword, getAdminUser, setAdminUser } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[460px] max-w-full rounded-[22px] p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                <h1 className="text-center text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Cambiar contraseña
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">Debes actualizar tu contraseña para continuar.</p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <input
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password" placeholder="Contraseña actual"
                        value={current} onChange={(e) => setCurrent(e.target.value)}
                    />
                    <input
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password" placeholder="Nueva contraseña"
                        value={next} onChange={(e) => setNext(e.target.value)}
                    />
                    <input
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password" placeholder="Confirmar nueva contraseña"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    />
                    <p className="text-xs text-white/60">
                        Requisitos: 8+ caracteres, 1 minúscula, 1 mayúscula, 1 número y 1 símbolo.
                    </p>
                    <button
                        disabled={!can}
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition disabled:opacity-50"
                    >
                        {busy ? 'Guardando...' : 'Guardar nueva contraseña'}
                    </button>
                    {msg && <p className="mt-2 text-sm text-red-400">{msg}</p>}
                </form>
            </div>
        </div>
    );
}
