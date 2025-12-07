import { useEffect, useState } from 'react';
import { adminGetUser } from '../../../services/adminApi';
import type { AdminUser } from '../../../types';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle2, Mail, Shield, Clock3, Edit3, Trash2 } from 'lucide-react';

export default function AdminUserShow() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [u, setU] = useState<AdminUser | null>(null);

    useEffect(() => {
        if (!id) return;
        (async () => setU(await adminGetUser(Number(id))))().catch(() => setU(null));
    }, [id]);

    if (!u) return <p className="text-white/70">Cargando…</p>;

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
                            <UserCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Usuario · {u.name}
                            </h2>
                            <p className="text-xs text-white/60">
                                Resumen de la cuenta y actividad reciente.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            to={`/admin/users/${u.id}/edit`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15 text-sm"
                        >
                            <Edit3 className="h-4 w-4" />
                            <span>Editar</span>
                        </Link>
                        <Link
                            to={`/admin/users/${u.id}/delete`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15 text-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                        </Link>
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

                <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-white/[0.08] border border-white/15 grid place-items-center">
                            <span className="text-lg font-semibold">
                                {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white/90">{u.name}</div>
                            <div className="flex items-center gap-1 text-xs text-white/60">
                                <Mail className="h-3 w-3" />
                                <span>{u.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-cyan-300" />
                            <div>
                                <div className="text-[11px] uppercase tracking-wide text-white/55">
                                    Rol
                                </div>
                                <div className="font-medium capitalize">{u.role}</div>
                            </div>
                        </div>

                        {u.last_login_at && (
                            <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-emerald-300" />
                                <div>
                                    <div className="text-[11px] uppercase tracking-wide text-white/55">
                                        Último ingreso
                                    </div>
                                    <div className="font-medium">
                                        {new Date(u.last_login_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {u.must_change_password && (
                        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            <span>El usuario debe cambiar su contraseña en el próximo inicio de sesión.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
