import { useEffect, useState } from 'react';
import { adminListUsers } from '../../../services/adminApi';
import type { AdminUser } from '../../../types';
import type { Page } from '../../../services/adminApi';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminUsersList() {
    const [data, setData] = useState<Page<AdminUser>>({ data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 20;
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const r = await adminListUsers<AdminUser>({ page, perPage, search: search || undefined });
            setData(r);
        } finally { setLoading(false); }
    };

    useEffect(() => { void load(); }, [page]); // eslint-disable-line

    const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); void load(); };

    const canPrev = data.current_page > 1;
    const canNext = data.current_page < data.last_page;
    const from = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const to = Math.min(data.current_page * data.per_page, data.total);

    return (
        <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                    Usuarios
                </h2>
                <form onSubmit={submitSearch} className="ml-auto flex items-center gap-2">
                    <input
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, email, rol..."
                        className="h-10 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40"
                    />
                    <button className="h-10 px-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15">
                        Buscar
                    </button>
                    <button
                        type="button"
                        onClick={() => nav('/admin/users/new')}
                        className="h-10 px-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10"
                    >
                        + Nuevo usuario
                    </button>
                </form>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-white/70">
                        <tr>
                            <th className="p-3 text-left">Nombre</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-center">Rol</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map(u => (
                            <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                                <td className="p-3">{u.name}</td>
                                <td className="p-3">{u.email}</td>
                                <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.06] text-xs">{u.role}</span>
                                    {u.must_change_password && <span className="ml-2 text-amber-300 text-xs">• debe cambiar contraseña</span>}
                                </td>
                                <td className="p-3 text-center">
                                    <div className="inline-flex gap-1.5">
                                        <Link to={`/admin/users/${u.id}`} className="px-2.5 py-1 rounded-lg text-xs border border-white/15 bg-white/[0.06] hover:bg-white/10">Ver</Link>
                                        <Link to={`/admin/users/${u.id}/edit`} className="px-2.5 py-1 rounded-lg text-xs border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15">Editar</Link>
                                        <Link to={`/admin/users/${u.id}/delete`} className="px-2.5 py-1 rounded-lg text-xs border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15">Eliminar</Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.data.length === 0 && (
                            <tr><td className="p-6 text-center text-white/60" colSpan={4}>{loading ? 'Cargando…' : 'Sin resultados'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between text-sm text-white/70">
                <div>
                    {data.total > 0 ? <>Mostrando <span className="text-white">{from}</span>–<span className="text-white">{to}</span> de <span className="text-white">{data.total}</span></> : 'Sin resultados'}
                    <span className="ml-3 text-white/50">Página {data.current_page} de {data.last_page}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button disabled={!canPrev} onClick={() => setPage(1)} className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}>« Primero</button>
                    <button disabled={!canPrev} onClick={() => setPage(p => Math.max(1, p - 1))} className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}>‹ Anterior</button>
                    <button disabled={!canNext} onClick={() => setPage(p => Math.min(data.last_page, p + 1))} className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}>Siguiente ›</button>
                    <button disabled={!canNext} onClick={() => setPage(data.last_page)} className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}>Última »</button>
                </div>
            </div>
        </div>
    );
}
