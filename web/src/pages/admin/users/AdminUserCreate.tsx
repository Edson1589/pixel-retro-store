import { useState } from 'react';
import { adminCreateUser } from '../../../services/adminApi';
import type { AdminUserCreatePayload, Role } from '../../../types';
import { useNavigate } from 'react-router-dom';
import {
    UserPlus,
    ArrowLeft,
    Mail,
    Shield,
    Clock3,
    UserCircle2,
} from 'lucide-react';
import FancySelect from '../../../components/FancySelect';

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
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                               bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                               shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                               flex items-center justify-center"
                        >
                            <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Nuevo usuario
                            </h2>
                            <p className="text-xs text-white/60">
                                Crea una cuenta con rol asignado y contraseña temporal enviada por correo.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => nav('/admin/users')}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                               border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>

                {/* FORMULARIO */}
                <form
                    onSubmit={submit}
                    className="mt-1 rounded-2xl border border-white/10 p-4 bg-white/[0.04]
                           w-full grid gap-3"
                >
                    {/* Nombre */}
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
                                placeholder="Nombre y apellido"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, name: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Email */}
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
                                placeholder="correo@ejemplo.com"
                                value={form.email}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, email: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Rol */}
                    {/* Rol */}
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>Rol</span>
                        </label>
                        <FancySelect
                            value={form.role}
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


                    {/* Validez contraseña temporal */}
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            <span>Validez de contraseña temporal (horas)</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-40">
                                <Clock3 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                                       pl-9 pr-3 text-sm outline-none text-white/90
                                       focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                    type="number"
                                    min={1}
                                    max={168}
                                    value={form.temp_expires_in_hours ?? 24}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            temp_expires_in_hours: Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                            <p className="text-[11px] text-white/55">
                                Ejemplo: <span className="text-white/80">24</span> horas (1 día).
                            </p>
                        </div>
                    </div>

                    {/* Botón + msg */}
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
                            {busy ? 'Creando…' : 'Crear usuario'}
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
