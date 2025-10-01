import { useEffect, useMemo, useState } from 'react';
import { adminListEvents } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Page } from '../../../services/adminApi'; // ⬅️ importar el tipo Page

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
    // Estado de paginación + datos
    const [data, setData] = useState<Page<AdminEvent>>({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    // UI local
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(15);

    const load = async (): Promise<void> => {
        setLoading(true);
        try {
            const res = (await adminListEvents({ page, perPage })) as Page<AdminEvent>;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    // Cargar al inicio y cuando cambien page/perPage
    useEffect(() => {
        void load();
    }, [page, perPage]);

    // Si cambia la búsqueda, volvemos a la página 1 (búsqueda local)
    useEffect(() => {
        setPage(1);
    }, [q]);

    // Lista filtrada (local, sobre la página actual)
    const list = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return data.data;
        return data.data.filter((e) => e.title.toLowerCase().includes(term));
    }, [data, q]);

    // Métricas (como antes, sobre la página actual)
    const stats = useMemo(() => {
        const now = Date.now();
        const total = data.data.length;
        const upcoming = data.data.filter((e) => new Date(e.start_at).getTime() >= now).length;
        const published = data.data.filter((e) => e.status === 'published').length;
        const drafts = data.data.filter((e) => e.status === 'draft').length;
        return { total, upcoming, published, drafts };
    }, [data]);

    // Pills
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

    // Helpers de paginación
    const canPrev = data.current_page > 1;
    const canNext = data.current_page < data.last_page;
    const from = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const to = Math.min(data.current_page * data.per_page, data.total);

    return (
        <div className="space-y-5 text-white">

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total', val: stats.total },
                    { label: 'Próximos', val: stats.upcoming },
                    { label: 'Publicados', val: stats.published },
                    { label: 'Borradores', val: stats.drafts },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl bg-white/[0.04] border border-white/10 p-4
                       shadow-[0_20px_40px_-24px_rgba(124,58,237,0.35)]"
                    >
                        <div className="text-white/70 text-sm">{s.label}</div>
                        <div className="text-2xl font-bold mt-1 text-[#06B6D4]">{s.val}</div>
                    </div>
                ))}
            </section>

            <div className="flex items-center gap-3">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                >
                    Eventos
                </h2>

                <div className="ml-auto flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar evento..."
                        className="h-9 w-56 rounded-xl px-3 bg-white/[0.05] text-white/90 placeholder:text-white/45
                       border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                    />

                    <Link
                        to="/admin/events/new"
                        className="h-9 px-3 rounded-xl text-white font-medium
                        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110
                        shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                        inline-flex items-center justify-center
            "
                    >
                        Nuevo Evento
                    </Link>
                </div>
            </div>

            {/* Table */}
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
                                    <th className="p-3 text-left font-semibold">Título</th>
                                    <th className="p-3 text-center font-semibold">Tipo</th>
                                    <th className="p-3 text-center font-semibold">Inicio</th>
                                    <th className="p-3 text-center font-semibold">Estado</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((ev) => (
                                    <tr key={ev.id} className="border-t border-white/10 hover:bg-white/[0.04]">
                                        <td className="p-3">{ev.title}</td>
                                        <td className="p-3 text-center">
                                            <span className={pillType(ev.type)}>
                                                {ev.type === 'tournament' ? 'Torneo' : 'Evento'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">{new Date(ev.start_at).toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            <span className={pillStatus(ev.status)}>
                                                {ev.status === 'published'
                                                    ? 'Publicado'
                                                    : ev.status === 'archived'
                                                        ? 'Archivado'
                                                        : 'Borrador'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2 text-[13px]">
                                                <Link className="text-cyan-300 hover:underline" to={`/admin/events/${ev.id}`}>
                                                    Ver
                                                </Link>
                                                <span className="text-white/20">•</span>
                                                <Link className="text-cyan-300 hover:underline" to={`/admin/events/${ev.id}/edit`}>
                                                    Editar
                                                </Link>
                                                <span className="text-white/20">•</span>
                                                <Link className="text-cyan-300 hover:underline" to={`/admin/events/${ev.id}/registrations`}>
                                                    Registros
                                                </Link>
                                                <span className="text-white/20">•</span>
                                                <Link className="text-rose-300 hover:underline" to={`/admin/events/${ev.id}/delete`}>
                                                    Eliminar
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

                    {/* Controles de página */}
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        <div className="text-white/70 text-sm">
                            {data.total > 0
                                ? <>Mostrando <span className="text-white">{from}</span>–<span className="text-white">{to}</span> de <span className="text-white">{data.total}</span></>
                                : 'Sin resultados'}
                            <span className="ml-3 text-white/50">Página {data.current_page} de {data.last_page}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage(1)}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Primera página"
                            >
                                « Primero
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Anterior"
                            >
                                ‹ Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Siguiente"
                            >
                                Siguiente ›
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage(data.last_page)}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Última página"
                            >
                                Última »
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
