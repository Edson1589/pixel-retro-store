import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { User, Mail, LockKeyhole, ShieldCheck } from 'lucide-react';

type LocationState = { next?: string };

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    password_confirmation: string;
};

export default function CustomerRegister() {
    const { register } = useCustomerAuth();
    const [form, setForm] = useState<RegisterForm>({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '',
    });
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const nav = useNavigate();
    const loc = useLocation();
    const next = (loc.state as LocationState | null)?.next ?? '/';

    const onChange =
        (key: keyof RegisterForm) =>
            (e: ChangeEvent<HTMLInputElement>) =>
                setForm((s) => ({ ...s, [key]: e.target.value }));

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setBusy(true);
            setMsg(null);
            await register(form);
            nav(next, { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error de registro');
        } finally {
            setBusy(false);
        }
    };

    const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const passwordsMatch =
        form.password.length > 0 &&
        form.password_confirmation.length > 0 &&
        form.password === form.password_confirmation;

    const passwordStrong = form.password.length > 0 && PASSWORD_POLICY.test(form.password);

    const canSubmit =
        !busy &&
        !!form.name &&
        !!form.email &&
        !!form.password &&
        !!form.password_confirmation &&
        passwordsMatch &&
        passwordStrong;



    return (
        <div className="min-h-screen place-items-center bg-[#07101B] p-4">
            <div className="w-[520px] max-w-full rounded-[22px] p-6
                      bg-white/[0.04] border border-white/10 backdrop-blur-xl
                      shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                <h1 className="text-center text-2xl font-extrabold
                       bg-clip-text text-transparent
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Crear cuenta
                </h1>
                <p className="mt-1 text-center text-white/70 text-sm">
                    Regístrate para comprar y seguir tus pedidos
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                    <label htmlFor="name" className="sr-only mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Nombre
                    </label>
                    <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Nombre
                    </span>
                    <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/15 overflow-hidden
    focus-within:ring-2 focus-within:ring-[#7C3AED66]
">
                        <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                            <User className="h-4 w-4 text-white/70" />
                        </div>
                        <input
                            required
                            id="name"
                            className="flex-1 px-3 py-2 bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            placeholder="Nombre"
                            value={form.name}
                            onChange={onChange('name')}
                            autoComplete="name"
                        />
                    </div>


                    <label htmlFor="email" className="sr-only">Email</label>
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
                            required
                            id="email"
                            className="flex-1 px-3 py-2 bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={onChange('email')}
                            autoComplete="email"
                        />
                    </div>


                    <div className="grid md:grid-cols-1 gap-3">
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                                Contraseña
                            </span>
                            <div
                                className={`flex items-center rounded-xl bg-white/[0.04] border border-white/15 overflow-hidden
                                focus-within:ring-2 focus-within:ring-[#7C3AED66]
                                ${form.password && !passwordStrong ? ' ring-2 ring-red-500 focus-within:ring-red-500' : ''}
                            `}
                            >
                                <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                                    <LockKeyhole className="h-4 w-4 text-white/70" />
                                </div>
                                <input
                                    id="password"
                                    className="flex-1 px-3 py-2 bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                                    type="password"
                                    placeholder="Contraseña"
                                    value={form.password}
                                    onChange={onChange('password')}
                                    autoComplete="new-password"
                                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                                    title="Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número."
                                    aria-invalid={form.password ? !passwordStrong : undefined}
                                    aria-describedby={!passwordStrong && form.password ? 'pwd-help' : undefined}
                                />
                            </div>

                            {form.password && !passwordStrong && (
                                <p id="pwd-help" className="text-xs text-amber-300/90" role="alert" aria-live="polite">
                                    La contraseña debe tener mínimo 8 caracteres, incluir al menos una mayúscula, una minúscula y un número.
                                </p>
                            )}

                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="sr-only">Confirmar contraseña</label>
                            <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                                Confirmar contraseña
                            </span>
                            <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/15 overflow-hidden
    focus-within:ring-2 focus-within:ring-[#7C3AED66]
">
                                <div className="h-10 w-10 grid place-items-center bg-white/5 border-r border-white/10">
                                    <ShieldCheck className="h-4 w-4 text-white/70" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    className="flex-1 px-3 py-2 bg-transparent text-white/90 placeholder:text-white/45 outline-none"
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    value={form.password_confirmation}
                                    onChange={onChange('password_confirmation')}
                                    autoComplete="new-password"
                                />
                            </div>

                        </div>
                    </div>

                    {!passwordsMatch && (form.password || form.password_confirmation) && (
                        <p className="text-xs text-amber-300/90">
                            Las contraseñas no coinciden.
                        </p>
                    )}

                    <button
                        className="mt-1 px-4 py-2 rounded-xl text-white font-medium
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canSubmit}
                    >
                        {busy ? 'Creando...' : 'Registrarme'}
                    </button>
                </form>

                {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}

                <p className="mt-4 text-sm text-white/80 text-center">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-[#06B6D4] hover:underline">Iniciar sesión</Link>
                </p>
            </div>
        </div>
    );
}
