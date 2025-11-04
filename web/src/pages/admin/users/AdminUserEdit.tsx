import { useEffect, useState } from 'react';
import { adminGetUser, adminUpdateUser } from '../../../services/adminApi';
import type { AdminUser, AdminUserUpdatePayload, Role } from '../../../types';
import { useNavigate, useParams } from 'react-router-dom';

const roleOptions: Array<{ label: string; value: Exclude<Role, 'customer'> }> = [
    { label: 'Admin', value: 'admin' },
    { label: 'Vendedor', value: 'seller' },
    { label: 'Técnico', value: 'technician' },
];

export default function AdminUserEdit() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [u, setU] = useState<AdminUser | null>(null);
    const [form, setForm] = useState<AdminUserUpdatePayload>({});
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            const user = await adminGetUser(Number(id));
            setU(user);
            setForm({ name: user.name, email: user.email, role: user.role as 'admin' | 'seller' | 'technician' });
        })().catch(() => setU(null));
    }, [id]);

    if (!u) return <p className="text-white/70">Cargando…</p>;

    const can = !!form.name && !!form.email && !!form.role && !busy;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            setBusy(true); setMsg(null);
            await adminUpdateUser(Number(id), form);
            nav(`/admin/users/${id}`, { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'No se pudo actualizar');
        } finally { setBusy(false); }
    };

    return (
        <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">Editar usuario</h2>
                <button onClick={() => nav(`/admin/users/${u.id}`)} className="ml-auto h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10">← Volver</button>
            </div>

            <form onSubmit={submit} className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] grid gap-3 max-w-xl">
                <input className="h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40" value={form.name ?? ''} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40" type="email" value={form.email ?? ''} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                <select className="h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none" value={form.role ?? 'seller'} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'seller' | 'technician' }))}>
                    {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <button disabled={!can} className="h-11 px-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15">
                    {busy ? 'Guardando…' : 'Guardar cambios'}
                </button>
                {msg && <p className="text-sm text-rose-300">{msg}</p>}
            </form>
        </div>
    );
}
