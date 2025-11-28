import { useEffect, useState } from 'react';
import { adminListUsers } from '../../../services/adminApi';
import type { AdminUser } from '../../../types';
import type { Page } from '../../../services/adminApi';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users as UsersIcon,
    Search,
    Plus,
    Mail,
    Shield,
    Eye,
    Pencil,
    Trash2,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    UserCircle2,
    KeyRound,
} from 'lucide-react';

export default function AdminUsersList() {
    const [data, setData] = useState<Page<AdminUser>>({ data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 20;
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const mustChangeCount = data.data.filter(u => u.must_change_password).length;

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
        <div className="text-white space-y-5">
            {/* HEADER + BUSCADOR */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-2xl
                               bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                               shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                               flex items-center justify-center"
                    >
                        <UsersIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                                   bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                            Usuarios
                        </h2>
                        <p className="text-xs text-white/60">
                            Gestiona cuentas, roles y accesos al panel administrativo.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="ml-auto flex flex-wrap items-center gap-2"
                >
                    <div className="relative">
                        <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, email, rol..."
                            className="h-10 w-56 sm:w-64 rounded-xl bg-white/5 border border-white/10
                                   pl-9 pr-3 text-sm text-white/90
                                   placeholder:text-white/45
                                   outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                        />
                    </div>
                    <button
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                               border border-white/10 bg-white/5 hover:bg-white/10
                               text-sm"
                    >
                        <Search className="h-4 w-4" />
                        <span>Buscar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => nav('/admin/users/new')}
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                               bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                               text-sm font-medium
                               shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                               hover:brightness-110"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo usuario</span>
                    </button>
                </form>
            </div>

            {/* RESUMEN RÁPIDO */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Total usuarios
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {data.total}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                        <KeyRound className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Deben cambiar contraseña (pág.)
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {mustChangeCount}
                        </div>
                    </div>
                </div>
            </section>

            {/* TABLA */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-white/70">
                        <tr>
                            <th className="p-3 text-left font-semibold">Usuario</th>
                            <th className="p-3 text-left font-semibold">Email</th>
                            <th className="p-3 text-center font-semibold">Rol</th>
                            <th className="p-3 text-center font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((u) => (
                            <tr
                                key={u.id}
                                className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                            >
                                {/* Nombre */}
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                                            <UserCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-white/90">
                                            {u.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="p-3">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Mail className="h-4 w-4 text-white/50" />
                                        <span className="truncate max-w-xs">{u.email}</span>
                                    </div>
                                </td>

                                {/* Rol */}
                                <td className="p-3 text-center">
                                    <span
                                        className={`
                                        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                        text-[11px] border
                                        ${u.role === 'admin'
                                                ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/40'
                                                : 'bg-white/5 text-white/80 border-white/15'}
                                    `}
                                    >
                                        <Shield className="h-3 w-3" />
                                        <span className="uppercase tracking-wide">
                                            {u.role}
                                        </span>
                                    </span>
                                    {u.must_change_password && (
                                        <span className="ml-2 text-amber-300 text-[11px]">
                                            • debe cambiar contraseña
                                        </span>
                                    )}
                                </td>

                                {/* Acciones */}
                                <td className="p-3 text-center">
                                    <div className="inline-flex gap-1.5">
                                        <Link
                                            to={`/admin/users/${u.id}`}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                                   text-[11px] border border-white/15 bg-white/[0.06]
                                                   hover:bg-white/10"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Ver</span>
                                        </Link>
                                        <Link
                                            to={`/admin/users/${u.id}/edit`}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                                   text-[11px] border border-cyan-400/30 bg-cyan-500/10
                                                   hover:bg-cyan-500/15"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            <span>Editar</span>
                                        </Link>
                                        <Link
                                            to={`/admin/users/${u.id}/delete`}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                                   text-[11px] border border-rose-400/30 bg-rose-500/10
                                                   hover:bg-rose-500/15"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>Eliminar</span>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {data.data.length === 0 && (
                            <tr>
                                <td
                                    className="p-6 text-center text-white/60"
                                    colSpan={4}
                                >
                                    {loading ? 'Cargando…' : 'Sin resultados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                <div>
                    {data.total > 0 ? (
                        <>
                            Mostrando{' '}
                            <span className="text-white font-medium">{from}</span>
                            –
                            <span className="text-white font-medium">{to}</span> de{' '}
                            <span className="text-white font-medium">{data.total}</span>
                        </>
                    ) : (
                        'Sin resultados'
                    )}
                    <span className="ml-3 text-white/50">
                        Página {data.current_page} de {data.last_page}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        disabled={!canPrev}
                        onClick={() => setPage(1)}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                                ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <ChevronsLeft className="h-3 w-3" />
                        <span>Primero</span>
                    </button>
                    <button
                        disabled={!canPrev}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                                ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <ChevronLeft className="h-3 w-3" />
                        <span>Anterior</span>
                    </button>
                    <button
                        disabled={!canNext}
                        onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                                ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <span>Siguiente</span>
                        <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                        disabled={!canNext}
                        onClick={() => setPage(data.last_page)}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                                ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <span>Última</span>
                        <ChevronsRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
