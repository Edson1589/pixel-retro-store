import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Product } from '../../../types';
import type { Page } from '../../../services/adminApi';
import {
    PackageSearch,
    Package2,
    Boxes,
    Activity,
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
type StatusFilter = 'all' | 'active' | 'inactive';

const toNumber = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

type MaybeStatus = { status?: unknown };

const isActive = (p: Product): boolean => {
    const raw = (p as unknown as MaybeStatus).status;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') return /act/i.test(raw) && !/inact/i.test(raw);
    if (typeof raw === 'number') return raw === 1;
    return false;
};

export default function AdminProductsList() {
    const [data, setData] = useState<Page<Product>>({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');

    const [page, setPage] = useState(1);
    const [perPage] = useState(20);

    const load = async () => {
        setLoading(true);
        try {
            const r = await listProducts({ page, perPage });
            setData(r);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [page, perPage]);

    useEffect(() => { setPage(1); }, [q, status]);


    const toNum = (v: unknown): number => {
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        if (typeof v === 'string') {
            const n = Number.parseFloat(v.trim());
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };

    const metrics = useMemo(() => {
        const items = data?.data ?? [];
        const pageTotal = items.length;

        const stockTotal = items.reduce<number>((acc, item) => {
            const raw = (item as Partial<Product> & { stock?: unknown }).stock;
            return acc + toNum(raw);
        }, 0);

        const act = items.filter(isActive).length;
        const inact = pageTotal - act;

        const overallTotal: number = data?.total ?? pageTotal;

        return { overallTotal, stockTotal, act, inact };
    }, [data]);

    const filtered = useMemo(() => {
        const qn = q.trim().toLowerCase();
        return data.data.filter((p) => {
            const okStatus =
                status === 'all' ? true : status === 'active' ? isActive(p) : !isActive(p);
            const name = String((p as { name?: unknown }).name ?? '').toLowerCase();
            return okStatus && (qn ? name.includes(qn) : true);
        });
    }, [data, q, status]);

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
                        <PackageSearch className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2
                            className="text-xl font-extrabold bg-clip-text text-transparent
                       bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                        >
                            Productos
                        </h2>
                        <p className="text-xs text-white/60">
                            Administra el catálogo, precios, stock y estado de cada producto.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="ml-auto flex flex-wrap items-center gap-2"
                >
                    {/* Buscador */}
                    <div className="relative">
                        <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por nombre, SKU..."
                            className="h-10 w-56 sm:w-64 rounded-xl bg-white/5 border border-white/10
                       pl-9 pr-3 text-sm text-white/90
                       placeholder:text-white/45
                       outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                        />
                    </div>

                    {/* Filtros de estado */}
                    <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-1">
                        {(['all', 'active', 'inactive'] as const).map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setStatus(v)}
                                className={`
                px-3 h-7 rounded-xl text-[11px] uppercase tracking-wide transition
                inline-flex items-center gap-1
                ${status === v
                                        ? 'bg-[#0b1224] text-white shadow-[0_4px_18px_-6px_rgba(99,102,241,0.5)] border border-white/10'
                                        : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                                    }
              `}
                            >
                                {v === 'all' && <Activity className="h-3 w-3" />}
                                {v === 'active' && <Package2 className="h-3 w-3" />}
                                {v === 'inactive' && <Trash2 className="h-3 w-3" />}
                                <span>
                                    {v === 'all' ? 'Todos' : v === 'active' ? 'Activos' : 'Inactivos'}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Nuevo producto */}
                    <Link
                        to="/admin/products/new"
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                     text-sm font-medium
                     shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                     hover:brightness-110"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo producto</span>
                    </Link>
                </form>
            </div>

            {/* RESUMEN RÁPIDO */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                        <Package2 className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Total productos
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {metrics.overallTotal}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                        <Boxes className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Stock total
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {metrics.stockTotal}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Activos / Inactivos
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {metrics.act} <span className="text-white/60">/</span> {metrics.inact}
                        </div>
                    </div>
                </div>
            </section>

            {/* TABLA */}
            {loading ? (
                <p className="text-white/70">Cargando…</p>
            ) : (
                <>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] text-white">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.03] text-white/70">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Producto</th>
                                    <th className="p-3 px-2 text-center font-semibold">Precio</th>
                                    <th className="p-3 px-2 text-center font-semibold">Stock</th>
                                    <th className="p-3 px-2 text-center font-semibold">Estado</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filtered.map((p) => {
                                    const price = toNumber((p as { price?: unknown }).price);
                                    const stock = toNumber((p as { stock?: unknown }).stock);
                                    const active = isActive(p);

                                    const name = String((p as { name?: unknown }).name ?? '—');
                                    const imgUrl =
                                        typeof (p as { image_url?: unknown }).image_url === 'string' &&
                                            (p as { image_url?: unknown }).image_url
                                            ? ((p as { image_url?: unknown }).image_url as string)
                                            : '/img/placeholder.jfif';

                                    return (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-white/[0.03] border-t border-white/5 transition-colors"
                                        >
                                            {/* Nombre + imagen */}
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                                                        <img
                                                            src={imgUrl}
                                                            alt={name}
                                                            loading="lazy"
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '';
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-white/90">
                                                            {name}
                                                        </div>
                                                        {/* Podrías mostrar SKU aquí si lo tienes */}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Precio */}
                                            <td className="py-3 px-2 text-center tabular-nums text-white/90">
                                                Bs. {price.toFixed(2)}
                                            </td>

                                            {/* Stock */}
                                            <td className="py-3 px-2 text-center">
                                                <span
                                                    className={`inline-flex items-center justify-center min-w-[34px] px-2 py-0.5 rounded-full text-[11px] border tabular-nums
                          ${stock > 0
                                                            ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                                                            : 'bg-rose-400/10 text-rose-300 border-rose-400/20'
                                                        }`}
                                                >
                                                    {stock}
                                                </span>
                                            </td>

                                            {/* Estado */}
                                            <td className="py-3 px-2 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border
                          ${active
                                                            ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                                                            : 'bg-rose-400/10 text-rose-300 border-rose-400/20'
                                                        }`}
                                                >
                                                    <Activity className="h-3 w-3" />
                                                    <span>{active ? 'ACTIVO' : 'INACTIVO'}</span>
                                                </span>
                                            </td>

                                            {/* Acciones */}
                                            <td className="p-3 text-center">
                                                <div className="inline-flex gap-1.5">
                                                    <Link
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                     text-[11px] border border-white/15 bg-white/[0.06]
                                     hover:bg-white/10"
                                                        to={`/admin/products/${p.id}`}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Ver</span>
                                                    </Link>
                                                    <Link
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                     text-[11px] border border-cyan-400/30 bg-cyan-500/10
                                     hover:bg-cyan-500/15"
                                                        to={`/admin/products/${p.id}/edit`}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span>Editar</span>
                                                    </Link>
                                                    <Link
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                     text-[11px] border border-rose-400/30 bg-rose-500/10
                                     hover:bg-rose-500/15"
                                                        to={`/admin/products/${p.id}/delete`}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>Eliminar</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td className="py-6 text-center text-white/70" colSpan={5}>
                                            No se encontraron productos.
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
                                type="button"
                                onClick={() => setPage(1)}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canPrev
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                                title="Primera página"
                            >
                                <ChevronsLeft className="h-3 w-3" />
                                <span>Primero</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canPrev
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                                title="Anterior"
                            >
                                <ChevronLeft className="h-3 w-3" />
                                <span>Anterior</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canNext
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                                title="Siguiente"
                            >
                                <span>Siguiente</span>
                                <ChevronRight className="h-3 w-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage(data.last_page)}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canNext
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                                title="Última página"
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
