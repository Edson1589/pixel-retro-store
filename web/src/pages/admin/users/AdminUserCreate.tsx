import { useState } from 'react';
import { adminCreateUser } from '../../../services/adminApi';
import type { AdminUserCreatePayload, Role } from '../../../types';
import { useNavigate } from 'react-router-dom';

const roleOptions: Array<{ label: string; value: Exclude<Role, 'customer'> }> = [
    { label: 'Admin', value: 'admin' },
    { label: 'Vendedor', value: 'seller' },
    { label: 'Técnico', value: 'technician' },
];

export default function AdminUserCreate() {
    const nav = useNavigate();
    const [form, setForm] = useState<AdminUserCreatePayload>({ name: '', email: '', role: 'seller', temp_expires_in_hours: 24 });
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const can = form.name.trim() && form.email.trim() && form.role && !busy;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setBusy(true); setMsg(null);
            await adminCreateUser(form);
            nav('/admin/users', { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'No se pudo crear el usuario');
        } finally { setBusy(false); }
    };

    return (
        <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">Nuevo usuario</h2>
                <button onClick={() => nav('/admin/users')} className="ml-auto h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10">← Volver</button>
            </div>

            <form onSubmit={submit} className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] grid gap-3 max-w-xl">
                <input className="h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40" placeholder="Nombre" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                <select className="h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'seller' | 'technician' }))}>
                    {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <label className="text-sm text-white/70">
                    Validez de contraseña temporal (horas)
                    <input className="mt-1 h-11 w-40 rounded-xl bg-white/10 border border-white/10 px-3 outline-none" type="number" min={1} max={168} value={form.temp_expires_in_hours ?? 24} onChange={(e) => setForm(f => ({ ...f, temp_expires_in_hours: Number(e.target.value) }))} />
                </label>

                <button disabled={!can} className="h-11 px-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15">
                    {busy ? 'Creando…' : 'Crear usuario'}
                </button>
                {msg && <p className="text-sm text-rose-300">{msg}</p>}
            </form>
        </div>
    );
}
