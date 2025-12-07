import { useEffect, useState } from 'react';
import { adminDeleteUser, adminGetUser } from '../../../services/adminApi';
import type { AdminUser } from '../../../types';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, Mail } from 'lucide-react';

export default function AdminUserDelete() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [u, setU] = useState<AdminUser | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => setU(await adminGetUser(Number(id))))().catch(() => setU(null));
    }, [id]);

    if (!u) return <p className="text-white/70">Cargando…</p>;

    const remove = async () => {
        if (!id) return;
        try {
            setBusy(true); setMsg(null);
            await adminDeleteUser(Number(id));
            nav('/admin/users', { replace: true });
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'No se pudo eliminar');
        } finally { setBusy(false); }
    };

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#f97373_0%,#fb7185_40%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(248,113,113,0.75)]
                       flex items-center justify-center"
                        >
                            <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#fb7185_0%,#f97316_40%,#facc15_100%)]">
                                Eliminar usuario
                            </h2>
                            <p className="text-xs text-white/60">
                                Esta acción no se puede deshacer. Revisa bien antes de confirmar.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => nav(`/admin/users/${u.id}`)}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>

                <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-200 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm">
                                ¿Seguro que deseas eliminar a{' '}
                                <strong>{u.name}</strong>{' '}
                                (<span className="inline-flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {u.email}
                                </span>)?
                            </p>
                            <p className="text-white/75 text-xs">
                                No puedes eliminarte a ti mismo ni al último administrador activo.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={remove}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                       border border-rose-400/60 bg-rose-500/20 hover:bg-rose-500/30 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{busy ? 'Eliminando…' : 'Sí, eliminar'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => nav(`/admin/users/${u.id}`)}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                       border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancelar</span>
                        </button>
                    </div>

                    {msg && (
                        <p className="mt-3 text-sm text-rose-200">
                            {msg}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

}
