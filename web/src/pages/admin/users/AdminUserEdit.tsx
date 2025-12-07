import { useEffect, useState } from 'react';
import { adminGetUser, adminUpdateUser } from '../../../services/adminApi';
import type { AdminUser, AdminUserUpdatePayload, Role } from '../../../types';
import { useNavigate, useParams } from 'react-router-dom';
import {
    UserCog,
    ArrowLeft,
    Mail,
    Shield,
    UserCircle2,
} from 'lucide-react';
import FancySelect from '../../../components/FancySelect';

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
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                        >
                            <UserCog className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Editar usuario
                            </h2>
                            <p className="text-xs text-white/60">
                                Actualiza los datos y el rol del usuario seleccionado.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => nav(`/admin/users/${u.id}`)}
                        type="button"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>

                <form
                    onSubmit={submit}
                    className="mt-1 rounded-2xl border border-white/10 p-4 bg-white/[0.04]
                   w-full grid gap-3"
                >
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <UserCircle2 className="h-3 w-3" />
                            <span>Nombre completo</span>
                        </label>
                        <div className="relative">
                            <UserCircle2 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                         pl-9 pr-3 text-sm outline-none
                         text-white/90 placeholder:text-white/45
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                value={form.name ?? ''}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, name: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>Email</span>
                        </label>
                        <div className="relative">
                            <Mail className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                         pl-9 pr-3 text-sm outline-none
                         text-white/90 placeholder:text-white/45
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                type="email"
                                value={form.email ?? ''}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, email: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>Rol</span>
                        </label>
                        <FancySelect
                            value={form.role ?? 'seller'}
                            onChange={(v) =>
                                setForm((f) => ({
                                    ...f,
                                    role: v as 'admin' | 'seller' | 'technician',
                                }))
                            }
                            options={roleOptions.map((o) => ({
                                value: o.value,
                                label: o.label,
                            }))}
                            placeholder="Seleccionar rol…"
                        />
                    </div>

                    <div className="pt-1 flex flex-col gap-2">
                        <button
                            disabled={!can}
                            className="h-11 px-4 rounded-xl
                       bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                       text-sm font-medium
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       hover:brightness-110
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {busy ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                        {msg && (
                            <p className="text-sm text-rose-300">
                                {msg}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );

}
