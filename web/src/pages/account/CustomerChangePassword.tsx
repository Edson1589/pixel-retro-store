import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerChangePassword, type PasswordChangePayload } from '../../services/customerApi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { LockKeyhole, KeyRound, ShieldCheck, Save } from 'lucide-react';

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
        <div className="min-h-screen place-items-center bg-[#07101B] px-3 sm:px-4 py-6 sm:py-10">
            <div
                className="
          w-full max-w-[520px]
          rounded-2xl sm:rounded-[22px]
          p-4 sm:p-6
          bg-white/[0.04] border border-white/10 backdrop-blur-xl
          shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]
        "
            >
                <h1 className="text-center text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Cambiar contraseña
                </h1>
                <p className="mt-1 text-center text-white/70 text-xs sm:text-sm">
                    {user?.must_change_password
                        ? 'Debes actualizar tu contraseña para continuar.'
                        : 'Actualiza tu contraseña.'}
                </p>

                <form onSubmit={submit} className="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3">
                    <div
                        className="
    flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden
    focus-within:ring-2 focus-within:ring-[#7C3AED66]
  "
                    >
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <LockKeyhole className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            className="
      flex-1 px-3 py-2.5 sm:py-2
      text-[15px] sm:text-base
      bg-transparent text-white/90 placeholder:text-white/45
      outline-none
    "
                            type="password"
                            placeholder="Contraseña actual"
                            value={form.current_password}
                            onChange={(e) => onChange('current_password')(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div
                        className={`
    flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden
    focus-within:ring-2 focus-within:ring-[#7C3AED66]
    ${form.new_password && !isStrong ? ' ring-2 ring-red-500 focus-within:ring-red-500' : ''}
  `}
                    >
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <KeyRound className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            className="
      flex-1 px-3 py-2.5 sm:py-2
      text-[15px] sm:text-base
      bg-transparent text-white/90 placeholder:text-white/45
      outline-none
    "
                            type="password"
                            placeholder="Nueva contraseña"
                            value={form.new_password}
                            onChange={(e) => onChange('new_password')(e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!form.new_password && !isStrong}
                        />
                    </div>


                    <div
                        className="
    flex items-center rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden
    focus-within:ring-2 focus-within:ring-[#7C3AED66]
  "
                    >
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <ShieldCheck className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            className="
      flex-1 px-3 py-2.5 sm:py-2
      text-[15px] sm:text-base
      bg-transparent text-white/90 placeholder:text-white/45
      outline-none
    "
                            type="password"
                            placeholder="Confirmar nueva contraseña"
                            value={form.new_password_confirmation}
                            onChange={(e) => onChange('new_password_confirmation')(e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={!!form.new_password_confirmation && !match}
                        />
                    </div>


                    <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                        Requisitos: 8+ caracteres, 1 minúscula, 1 mayúscula, 1 número y 1 símbolo.
                    </p>

                    {!match && (form.new_password || form.new_password_confirmation) && (
                        <p className="text-[11px] sm:text-xs text-amber-300/90">Las contraseñas no coinciden.</p>
                    )}

                    <button
                        disabled={!can}
                        className="
                        mt-1 w-full
                        px-4 py-2.5 sm:py-2
                        rounded-xl text-white font-medium
                        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                        hover:brightness-110 transition
                        disabled:opacity-50 disabled:cursor-not-allowed
                        inline-flex items-center justify-center gap-2
                    "
                    >
                        <Save className="h-4 w-4" />
                        <span>{busy ? 'Guardando...' : 'Guardar nueva contraseña'}</span>
                    </button>


                    {msg && (
                        <p className="mt-2 text-sm text-emerald-300" aria-live="polite">
                            {msg}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
