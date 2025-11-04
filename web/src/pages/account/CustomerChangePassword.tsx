import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerChangePassword, type PasswordChangePayload } from '../../services/customerApi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function CustomerChangePassword() {
    const nav = useNavigate();
    const { user } = useCustomerAuth();

    const [form, setForm] = useState<PasswordChangePayload>({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const isStrong = strong.test(form.new_password);
    const match = form.new_password && form.new_password === form.new_password_confirmation;
    const can = !busy && form.current_password && isStrong && match;

    const onChange = (k: keyof PasswordChangePayload) => (v: string) =>
        setForm((s) => ({ ...s, [k]: v }));

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setBusy(true);
            setMsg(null);
            await customerChangePassword(form);
            setMsg('Contraseña actualizada. Redirigiendo...');
            setTimeout(() => nav('/', { replace: true }), 650);
        } catch (err) {
            setMsg(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[520px] max-w-full rounded-[22px] p-6 bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                <h1 className="text-center text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Cambiar contraseña
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">
                    {user?.must_change_password ? 'Debes actualizar tu contraseña para continuar.' : 'Actualiza tu contraseña.'}
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <input
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password"
                        placeholder="Contraseña actual"
                        value={form.current_password}
                        onChange={(e) => onChange('current_password')(e.target.value)}
                        autoComplete="current-password"
                    />

                    <input
                        className={`w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66] ${form.new_password && !isStrong ? 'ring-2 ring-red-500 focus:ring-red-500' : ''}`}
                        type="password"
                        placeholder="Nueva contraseña"
                        value={form.new_password}
                        onChange={(e) => onChange('new_password')(e.target.value)}
                        autoComplete="new-password"
                    />

                    <input
                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={form.new_password_confirmation}
                        onChange={(e) => onChange('new_password_confirmation')(e.target.value)}
                        autoComplete="new-password"
                    />

                    <p className="text-xs text-white/60">
                        Requisitos: 8+ caracteres, 1 minúscula, 1 mayúscula, 1 número y 1 símbolo.
                    </p>

                    {!match && (form.new_password || form.new_password_confirmation) && (
                        <p className="text-xs text-amber-300/90">Las contraseñas no coinciden.</p>
                    )}

                    <button
                        disabled={!can}
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition disabled:opacity-50"
                    >
                        {busy ? 'Guardando...' : 'Guardar nueva contraseña'}
                    </button>

                    {msg && <p className="mt-2 text-sm text-emerald-300" aria-live="polite">{msg}</p>}
                </form>
            </div>
        </div>
    );
}
