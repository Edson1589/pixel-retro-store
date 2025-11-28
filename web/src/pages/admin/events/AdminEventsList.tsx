import { useEffect, useMemo, useState } from 'react';
import { adminListEvents } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Page } from '../../../services/adminApi';
import {
    CalendarDays,
    Search,
    Plus,
    Trophy,
    CalendarClock,
    Users as UsersIcon,
    Eye,
    Pencil,
    ClipboardList,
    Trash2,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from 'lucide-react';

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

interface AdminEvent {
    id: number | string;
    title: string;
    type: EventKind;
    start_at: string;
    status: EventStatus;
}


export default function AdminEventsList() {
    const [data, setData] = useState<Page<AdminEvent>>({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);

    const load = async (): Promise<void> => {
        setLoading(true);
        try {
            const res = (await adminListEvents({ page, perPage })) as Page<AdminEvent>;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [page, perPage]);

    useEffect(() => {
        setPage(1);
    }, [q]);

    const list = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return data.data;
        return data.data.filter((e) => e.title.toLowerCase().includes(term));
    }, [data, q]);

    const stats = useMemo(() => {
        const items = data?.data ?? [];
        const now = Date.now();

        const overallTotal: number = data?.total ?? items.length;

        const upcoming = items.filter(e => new Date(e.start_at).getTime() >= now).length;
        const published = items.filter(e => e.status === 'published').length;
        const drafts = items.filter(e => e.status === 'draft').length;

        return { total: overallTotal, upcoming, published, drafts };
    }, [data]);

    const pillType = (t: EventKind) =>
        t === 'tournament'
            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-violet-400/20 text-violet-300 bg-violet-500/15'
            : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-cyan-400/20 text-cyan-300 bg-cyan-500/15';

    const pillStatus = (s: EventStatus) => {
        if (s === 'published')
            return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-emerald-400/20 text-emerald-300 bg-emerald-500/15';
        if (s === 'archived')
            return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-rose-400/20 text-rose-300 bg-rose-500/15';
        return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/15 text-white/70 bg-white/10';
    };

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
                        <CalendarDays className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2
                            className="text-xl font-extrabold bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                        >
                            Eventos
                        </h2>
                        <p className="text-xs text-white/60">
                            Administra torneos, lanzamientos y actividades especiales de la tienda.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        // si ya tienes submitSearch, usa: submitSearch(e);
                    }}
                    className="ml-auto flex flex-wrap items-center gap-2"
                >
                    <div className="relative">
                        <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por título, tipo, estado..."
                            className="h-10 w-56 sm:w-64 rounded-xl bg-white/5 border border-white/10
                     pl-9 pr-3 text-sm text-white/90
                     placeholder:text-white/45
                     outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-white/10 bg-white/5 hover:bg-white/10
                     text-sm"
                    >
                        <Search className="h-4 w-4" />
                        <span>Buscar</span>
                    </button>
                    <Link
                        to="/admin/events/new"
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                     text-sm font-medium
                     shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                     hover:brightness-110"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo evento</span>
                    </Link>
                </form>
            </div>

            {/* RESUMEN RÁPIDO */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Total eventos
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {stats.total}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                        <CalendarClock className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Próximos
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {stats.upcoming}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Publicados
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {stats.published}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Borradores
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {stats.drafts}
                        </div>
                    </div>
                </div>
            </section>

            {/* TABLA / LISTADO */}
            {loading ? (
                <p className="text-white/70">Cargando…</p>
            ) : (
                <>
                    <div
                        className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]
                     shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
                    >
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.03] text-white/70">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Evento</th>
                                    <th className="p-3 text-center font-semibold">Tipo</th>
                                    <th className="p-3 text-center font-semibold">Inicio</th>
                                    <th className="p-3 text-center font-semibold">Estado</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((ev) => (
                                    <tr
                                        key={ev.id}
                                        className="border-t border-white/10 hover:bg-white/[0.04] transition-colors"
                                    >
                                        {/* Título + banner */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                                                    <img
                                                        src={
                                                            typeof (ev as { banner_url?: unknown }).banner_url ===
                                                                'string' &&
                                                                (ev as { banner_url?: unknown }).banner_url
                                                                ? ((ev as { banner_url?: unknown })
                                                                    .banner_url as string)
                                                                : ''
                                                        }
                                                        alt={ev.title}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/img/placeholder.jfif';
                                                        }}
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-white/90">
                                                        {ev.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Tipo */}
                                        <td className="p-3 text-center">
                                            <span className={pillType(ev.type)}>
                                                {ev.type === 'tournament' ? (
                                                    <>
                                                        <Trophy className="h-3 w-3 mr-1" />
                                                        Torneo
                                                    </>
                                                ) : (
                                                    <>
                                                        <CalendarDays className="h-3 w-3 mr-1" />
                                                        Evento
                                                    </>
                                                )}
                                            </span>
                                        </td>

                                        {/* Inicio */}
                                        <td className="p-3 text-center">
                                            {new Date(ev.start_at).toLocaleString()}
                                        </td>

                                        {/* Estado */}
                                        <td className="p-3 text-center">
                                            <span className={pillStatus(ev.status)}>
                                                {ev.status === 'published'
                                                    ? 'Publicado'
                                                    : ev.status === 'archived'
                                                        ? 'Archivado'
                                                        : 'Borrador'}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="p-3 text-center">
                                            <div className="inline-flex gap-1.5">
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-white/15 bg-white/[0.06]
                                   hover:bg-white/10"
                                                    to={`/admin/events/${ev.id}`}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Ver</span>
                                                </Link>
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-cyan-400/30 bg-cyan-500/10
                                   hover:bg-cyan-500/15"
                                                    to={`/admin/events/${ev.id}/edit`}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span>Editar</span>
                                                </Link>
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-emerald-400/30 bg-emerald-500/10
                                   hover:bg-emerald-500/15"
                                                    to={`/admin/events/${ev.id}/registrations`}
                                                >
                                                    <ClipboardList className="h-3.5 w-3.5" />
                                                    <span>Registros</span>
                                                </Link>
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-rose-400/30 bg-rose-500/10
                                   hover:bg-rose-500/15"
                                                    to={`/admin/events/${ev.id}/delete`}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Eliminar</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {list.length === 0 && (
                                    <tr>
                                        <td className="p-5 text-center text-white/60" colSpan={5}>
                                            No hay eventos todavía.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    <div className="flex flex-wrap items-center gap-3 justify-between text-sm text-white/70">
                        <div>
                            {data.total > 0 ? (
                                <>
                                    Mostrando{' '}
                                    <span className="text-white font-medium">{from}</span>–
                                    <span className="text-white font-medium">{to}</span> de{' '}
                                    <span className="text-white font-medium">
                                        {data.total}
                                    </span>
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
                                type="button"
                                onClick={() => setPage(1)}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                        ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <ChevronsLeft className="h-3 w-3" />
                                <span>Primero</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                        ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <ChevronLeft className="h-3 w-3" />
                                <span>Anterior</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                        ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <span>Siguiente</span>
                                <ChevronRight className="h-3 w-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage(data.last_page)}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                        ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <span>Última</span>
                                <ChevronsRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

}
