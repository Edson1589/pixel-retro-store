import { useEffect, useMemo, useState } from 'react';
import { fetchEvents } from '../services/api';
import { Link } from 'react-router-dom';
import FancySelect, { type Option } from '../components/FancySelect';

type EventKind = 'event' | 'tournament';
type TypeFilter = 'all' | EventKind;
type SortKey = 'date_asc' | 'date_desc';

interface StoreEvent {
    id: number | string;
    slug: string;
    title: string;
    type: EventKind;
    start_at: string;
    banner_url?: string | null;
}

interface EventsListResponse { data: StoreEvent[]; }

type PageMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const fmt = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
};
const ts = (iso: string) => new Date(iso).getTime();

export default function EventsList() {
    const [data, setData] = useState<EventsListResponse>({ data: [] });
    const [meta, setMeta] = useState<PageMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState('');
    const [type, setType] = useState<TypeFilter>('all');
    const [sort, setSort] = useState<SortKey>('date_asc');

    const [page, setPage] = useState(1);
    const [perPage] = useState(15);

    const load = async (forcePage?: number) => {
        setLoading(true);
        setError(null);
        try {
            const pageToUse = forcePage ?? page;
            const res = await fetchEvents<StoreEvent>({
                search: q || undefined,
                type: type === 'all' ? undefined : type,
                upcoming: true,
                page: pageToUse,
                per_page: perPage,
            });

            const { data: items, current_page, last_page, per_page, total } = res;
            setData({ data: items });
            setMeta({ current_page, last_page, per_page, total });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error cargando eventos');
            setData({ data: [] });
            setMeta({ current_page: 1, last_page: 1, per_page: perPage, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [page, perPage, type]);

    // resetear página cuando cambie búsqueda o tipo
    useEffect(() => { setPage(1); }, [q, type]);

    const sorted = useMemo(() => {
        const list = [...data.data];
        if (sort === 'date_asc') list.sort((a, b) => ts(a.start_at) - ts(b.start_at));
        if (sort === 'date_desc') list.sort((a, b) => ts(b.start_at) - ts(a.start_at));
        return list;
    }, [data, sort]);

    const totals = useMemo(() => {
        const items = data.data;
        return {
            total: items.length,
            eventos: items.filter(i => i.type === 'event').length,
            torneos: items.filter(i => i.type === 'tournament').length,
        };
    }, [data]);

    const typeOptions: Option[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Eventos', value: 'event' },
        { label: 'Torneos', value: 'tournament' },
    ];
    const sortOptions: Option[] = [
        { label: 'Más próximos', value: 'date_asc' },
        { label: 'Más lejanos', value: 'date_desc' },
    ];

    const canPrev = meta.current_page > 1;
    const canNext = meta.current_page < meta.last_page;
    const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
    const to = Math.min(meta.current_page * meta.per_page, meta.total);

    const applySearch = () => {
        if (page !== 1) setPage(1);
        else void load(1);
    };

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-6xl mx-auto p-4">
                <main className="space-y-6">
                    {/* HERO */}
                    <section className="rounded-[20px] px-8 py-6 text-white
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                       shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                       border border-white/10">
                        <h2 className="text-center text-2xl font-extrabold tracking-wider">
                            Eventos & Torneos
                        </h2>
                        <p className="mt-2 text-center text-white/90 text-sm">
                            Descubre lanzamientos, ferias retro y torneos competitivos. ¡Nos vemos allí!
                        </p>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}
                                className="px-4 py-2 rounded-full bg-white text-[#07101B] font-semibold text-sm
                           shadow-[0_8px_24px_-8px_rgba(2,6,23,0.35)] hover:brightness-105"
                            >
                                Explorar ahora
                            </button>
                        </div>
                    </section>

                    {/* MÉTRICAS */}
                    <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Próximos', val: totals.total },
                            { label: 'Eventos', val: totals.eventos },
                            { label: 'Torneos', val: totals.torneos },
                        ].map(s => (
                            <div
                                key={s.label}
                                className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-white
                           shadow-[0_20px_40px_-24px_rgba(124,58,237,0.35)]"
                            >
                                <div className="text-white/70 text-sm">{s.label}</div>
                                <div className="text-2xl font-bold mt-1 text-[#06B6D4]">{s.val}</div>
                            </div>
                        ))}
                    </section>

                    {/* FILTROS */}
                    <section className="relative z-10 flex flex-wrap items-center gap-2">
                        {/* Buscador */}
                        <div className="flex-1 min-w-[220px]">
                            <input
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="Buscar eventos o torneos..."
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applySearch()}
                            />
                        </div>

                        {/* Tipo */}
                        <FancySelect
                            className="min-w-[160px]"
                            value={type}
                            onChange={(v) => setType(v as TypeFilter)}
                            options={typeOptions}
                        />

                        {/* Orden */}
                        <FancySelect
                            className="min-w-[150px]"
                            value={sort}
                            onChange={(v) => setSort(v as SortKey)}
                            options={sortOptions}
                        />

                        <button
                            onClick={applySearch}
                            className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)] text-white font-medium
                         shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)] hover:brightness-110"
                        >
                            Buscar
                        </button>
                    </section>

                    {/* RESULTADOS */}
                    {error && <p className="text-red-400">{error}</p>}
                    {loading && <p className="text-white/70">Cargando…</p>}

                    {!loading && (
                        <>
                            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {sorted.map((item, idx) => {
                                    const { date, time } = fmt(item.start_at);
                                    const fallback =
                                        idx % 3 === 0
                                            ? 'bg-[linear-gradient(135deg,#2A3342_0%,#202836_100%)]'
                                            : idx % 3 === 1
                                                ? 'bg-[linear-gradient(135deg,#4F46E5_0%,#4338CA_100%)]'
                                                : 'bg-[linear-gradient(135deg,#0EA5E9_0%,#0369A1_100%)]';

                                    return (
                                        <Link
                                            to={`/events/${item.slug}`}
                                            key={item.id}
                                            className="group rounded-2xl overflow-hidden transition
                               border border-white/10 bg-white/[0.04] backdrop-blur
                               shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]
                               hover:shadow-[0_20px_60px_-25px_rgba(99,102,241,0.35)] hover:-translate-y-0.5"
                                        >
                                            <div
                                                className={`aspect-[16/9] flex items-center justify-center
                                  ${item.banner_url ? '' : `${fallback} text-white text-3xl md:text-4xl font-semibold`}`}
                                            >
                                                {item.banner_url ? (
                                                    <img
                                                        src={item.banner_url}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <span className="px-4 text-center drop-shadow-md">{item.title}</span>
                                                )}
                                            </div>

                                            <div className="p-4 border-t border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]">
                                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                                    {item.type === 'tournament' ? 'TORNEO' : 'EVENTO'}
                                                </div>
                                                <div className="mt-0.5 font-semibold text-slate-100">{item.title}</div>
                                                <div className="mt-1 text-xs text-slate-400">{date} — {time}</div>
                                            </div>
                                        </Link>
                                    );
                                })}

                                {sorted.length === 0 && (
                                    <p className="col-span-full text-white/70">Sin resultados.</p>
                                )}
                            </section>

                            {/* PAGINACIÓN */}
                            <div className="flex flex-wrap items-center gap-3 justify-between">
                                <div className="text-white/70 text-sm">
                                    {meta.total > 0
                                        ? <>Mostrando <span className="text-white">{from}</span>–<span className="text-white">{to}</span> de <span className="text-white">{meta.total}</span></>
                                        : 'Sin resultados'}
                                    <span className="ml-3 text-white/50">Página {meta.current_page} de {meta.last_page}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage(1)}
                                        disabled={!canPrev}
                                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        « Primero
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={!canPrev}
                                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        ‹ Anterior
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                        disabled={!canNext}
                                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        Siguiente ›
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage(meta.last_page)}
                                        disabled={!canNext}
                                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        Última »
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
