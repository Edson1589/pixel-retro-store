import { useEffect, useMemo, useState } from 'react';
import { adminListCategories, type Page } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Category } from '../../../types';

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
        <div className="space-y-5">

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-sm text-white/70">Total categorías</div>
                    <div className="mt-1 text-2xl font-bold text-[#06B6D4]">{metrics.totalCats}</div>
                </div>
                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-sm text-white/70">Total productos</div>
                    <div className="mt-1 text-2xl font-bold text-[#06B6D4]">{metrics.totalProducts}</div>
                </div>
                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-sm text-white/70">Categoría más grande</div>
                    <div className="mt-1 text-lg font-semibold text-[#06B6D4]">
                        {metrics.largest.name || '—'}
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-2">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                >
                    Categorías
                </h2>
                <div className="ml-auto flex items-center gap-2">
                    <input
                        className="h-9 w-full sm:w-80 rounded-xl px-3
                     bg-white/[0.06] text-white/90 placeholder:text-white/45
                     border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        placeholder="Buscar categoría..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <Link
                        to="/admin/categories/new"
                        className="h-9 px-3 rounded-xl text-white font-medium
             bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110
             shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
             inline-flex items-center justify-center"
                    >
                        Nueva Categoría
                    </Link>
                </div>
            </div>

            {loading ? (
                <p className="text-white/70">Cargando…</p>
            ) : (
                <>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] text-white">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.03] text-white/70">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Nombre</th>
                                    <th className="p-3 text-center font-semibold">Slug</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {list.map((c) => (
                                    <tr key={c.id} className="hover:bg-white/[0.035]">
                                        <td className="py-3 pl-4 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span>{c.name}</span>
                                                <span className="ml-1 inline-flex items-center justify-center px-2 h-5 rounded-full
                                       text-[11px] text-[#07101B] bg-[#06B6D4] font-semibold">
                                                    {getCount(c)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">{c.slug}</td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2 text-[13px]">
                                                <Link className="text-cyan-300 hover:underline" to={`/admin/categories/${c.id}`}>Ver</Link>
                                                <span className="text-white/20">•</span>
                                                <Link className="text-cyan-300 hover:underline" to={`/admin/categories/${c.id}/edit`}>Editar</Link>
                                                <span className="text-white/20">•</span>
                                                <Link className="text-rose-300 hover:underline" to={`/admin/categories/${c.id}/delete`}>Eliminar</Link>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {list.length === 0 && (
                                    <tr>
                                        <td className="py-6 text-center text-white/70" colSpan={3}>
                                            No se encontraron categorías.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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
