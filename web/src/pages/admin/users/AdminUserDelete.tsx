import { useEffect, useState } from 'react';
import { adminDeleteUser, adminGetUser } from '../../../services/adminApi';
import type { AdminUser } from '../../../types';
import { useNavigate, useParams } from 'react-router-dom';

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
        <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                    Eliminar usuario
                </h2>
                <button onClick={() => nav(`/admin/users/${u.id}`)} className="ml-auto h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10">← Volver</button>
            </div>

            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] max-w-xl">
                <p>¿Seguro que deseas eliminar a <strong>{u.name}</strong> ({u.email})?</p>
                <p className="text-white/70 text-sm mt-1">No puedes eliminarte a ti mismo ni al último admin.</p>
                <div className="mt-4 flex gap-2">
                    <button onClick={remove} disabled={busy} className="h-10 px-3 rounded-xl border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15">{busy ? 'Eliminando…' : 'Sí, eliminar'}</button>
                    <button onClick={() => nav(`/admin/users/${u.id}`)} className="h-10 px-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10">Cancelar</button>
                </div>
                {msg && <p className="mt-3 text-sm text-rose-300">{msg}</p>}
            </div>
        </div>
    );
}
