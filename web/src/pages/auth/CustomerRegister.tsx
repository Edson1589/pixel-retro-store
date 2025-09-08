import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

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
            await register(form); // asume que register recibe este shape
            nav(next, { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error de registro');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Crear cuenta</h2>
            <form onSubmit={submit} className="grid gap-3">
                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={onChange('name')}
                    autoComplete="name"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={onChange('email')}
                    autoComplete="email"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Teléfono"
                    type="tel"
                    value={form.phone}
                    onChange={onChange('phone')}
                    autoComplete="tel"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Dirección"
                    value={form.address}
                    onChange={onChange('address')}
                    autoComplete="street-address"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={onChange('password')}
                    autoComplete="new-password"
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={form.password_confirmation}
                    onChange={onChange('password_confirmation')}
                    autoComplete="new-password"
                />
                <button
                    className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                    disabled={busy}
                >
                    {busy ? 'Creando...' : 'Registrarme'}
                </button>
            </form>
            {msg && <p className="text-red-600 mt-3">{msg}</p>}
            <p className="mt-3 text-sm">
                ¿Ya tienes cuenta? <Link to="/login" className="underline">Iniciar sesión</Link>
            </p>
        </div>
    );
}
