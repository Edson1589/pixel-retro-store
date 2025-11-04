import { useEffect, useState } from 'react';
import { adminGetUser } from '../../../services/adminApi';
import type { AdminUser } from '../../../types';
import { useNavigate, useParams, Link } from 'react-router-dom';

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
        <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">Usuario · {u.name}</h2>
                <button onClick={() => nav('/admin/users')} className="ml-auto h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10">← Volver</button>
            </div>

            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] max-w-xl space-y-2">
                <div><strong>Nombre:</strong> {u.name}</div>
                <div><strong>Email:</strong> {u.email}</div>
                <div><strong>Rol:</strong> {u.role}</div>
                {u.must_change_password && <div className="text-amber-300">Debe cambiar contraseña</div>}
                {u.last_login_at && <div><strong>Último ingreso:</strong> {new Date(u.last_login_at).toLocaleString()}</div>}
            </div>

            <div className="flex gap-2">
                <Link to={`/admin/users/${u.id}/edit`} className="h-10 px-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15">Editar</Link>
                <Link to={`/admin/users/${u.id}/delete`} className="h-10 px-3 rounded-xl border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15">Eliminar</Link>
            </div>
        </div>
    );
}
