import { useEffect, useMemo, useState } from 'react';
import { adminListCategories, type Page } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Category } from '../../../types';
import {
    Boxes,
    FolderTree,
    Star,
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from 'lucide-react';

type SortKey = 'name' | 'slug' | 'count_desc';

const toNumber = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};
type CountLike = { product_count?: unknown; products_count?: unknown; count?: unknown };
const getCount = (c: Category): number => {
    const k = c as unknown as CountLike;
    return toNumber(k.product_count ?? k.products_count ?? k.count ?? 0);
};

export default function AdminCategoriesList() {
    const [data, setData] = useState<Page<Category>>({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState('');
    const [sort] = useState<SortKey>('name');

    const [page, setPage] = useState(1);
    const [perPage] = useState(20);

    const load = async () => {
        setLoading(true);
        try {
            const res = (await adminListCategories({ page, perPage })) as Page<Category>;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [page, perPage]);

    useEffect(() => { setPage(1); }, [q]);

    const metrics = useMemo(() => {
        const cats = data.data;
        const totalCats = cats.length;
        const totalProducts = cats.reduce((a, c) => a + getCount(c), 0);
        const largest = cats.reduce<{ name: string; count: number }>(
            (acc, c) => {
                const cnt = getCount(c);
                return cnt > acc.count ? { name: (c.name ?? '') as string, count: cnt } : acc;
            },
            { name: '', count: -1 }
        );
        return { totalCats, totalProducts, largest };
    }, [data]);

    const list = useMemo(() => {
        const qn = q.trim().toLowerCase();
        const filtered = data.data.filter(c =>
            qn ? (String(c.name ?? '').toLowerCase().includes(qn) || String(c.slug ?? '').toLowerCase().includes(qn)) : true
        );
        const sorted = [...filtered].sort((a, b) => {
            if (sort === 'name') return String(a.name ?? '').localeCompare(String(b.name ?? ''));
            if (sort === 'slug') return String(a.slug ?? '').localeCompare(String(b.slug ?? ''));
            return getCount(b) - getCount(a);
        });
        return sorted;
    }, [data, q, sort]);

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
                        <FolderTree className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2
                            className="text-xl font-extrabold bg-clip-text text-transparent
                       bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                        >
                            Categorías
                        </h2>
                        <p className="text-xs text-white/60">
                            Organiza tu catálogo por familias de productos y mejora la navegación de la tienda.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="ml-auto flex flex-wrap items-center gap-2"
                >
                    <div className="relative">
                        <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            className="h-10 w-56 sm:w-70 rounded-xl bg-white/5 border border-white/10
                       pl-9 pr-3 text-sm text-white/90
                       placeholder:text-white/45
                       outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                            placeholder="Buscar categoría por nombre o slug..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/admin/categories/new"
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                     text-sm font-medium
                     shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                     hover:brightness-110"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nueva categoría</span>
                    </Link>
                </form>
            </div>

            {/* RESUMEN RÁPIDO */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                        <FolderTree className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Total categorías
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {metrics.totalCats}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-violet-500/15 border border-violet-400/40 flex items-center justify-center">
                        <Boxes className="h-4 w-4 text-violet-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Total productos
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {metrics.totalProducts}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                        <Star className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Categoría más grande
                        </div>
                        <div className="text-sm font-semibold text-white/90 truncate">
                            {metrics.largest.name || '—'}
                        </div>
                    </div>
                </div>
            </section>

            {/* TABLA + PAGINACIÓN */}
            {loading ? (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                    <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] text-white/70">
                            <tr>
                                <th className="p-3 text-left font-semibold">Nombre</th>
                                <th className="p-3 text-center font-semibold">Slug</th>
                                <th className="p-3 text-center font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    className="p-6 text-center text-white/60"
                                    colSpan={3}
                                >
                                    Cargando…
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <>
                    {/* TABLA */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.03] text-white/70">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Nombre</th>
                                    <th className="p-3 text-center font-semibold">Slug</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                                    >
                                        {/* Nombre */}
                                        <td className="py-3 pl-4 pr-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                                                    <FolderTree className="h-4 w-4 text-white/80" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white/90">
                                                        {c.name}
                                                    </span>
                                                    <span className="text-[11px] text-white/45">
                                                        {getCount(c)} producto{getCount(c) === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Slug */}
                                        <td className="py-3 px-2 text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full
                                     bg-white/5 border border-white/15 text-[11px] font-mono text-white/75">
                                                {c.slug}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="p-3 text-center">
                                            <div className="inline-flex gap-1.5">
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-white/15 bg-white/[0.06]
                                   hover:bg-white/10"
                                                    to={`/admin/categories/${c.id}`}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Ver</span>
                                                </Link>
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-cyan-400/30 bg-cyan-500/10
                                   hover:bg-cyan-500/15"
                                                    to={`/admin/categories/${c.id}/edit`}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span>Editar</span>
                                                </Link>
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   text-[11px] border border-rose-400/30 bg-rose-500/10
                                   hover:bg-rose-500/15"
                                                    to={`/admin/categories/${c.id}/delete`}
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
                                        <td
                                            className="p-6 text-center text-white/60"
                                            colSpan={3}
                                        >
                                            No se encontraron categorías.
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
                </>
            )}
        </div>
    );

}
