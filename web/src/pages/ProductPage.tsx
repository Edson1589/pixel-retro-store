import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, type Page } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import type { Product, Category } from '../types';
import FancySelect, { type Option } from '../components/FancySelect';

type ProductsResponse = Page<Product>;
type SortKey = 'popular' | 'price_asc' | 'price_desc';


const getPrice = (p: Product): number => {
    const price = (p as { price?: number | null }).price;
    return typeof price === 'number' ? price : 0;
};
const getCategoryName = (p: Product): string => {
    const cat = (p as { category?: { name?: string | null } | null }).category;
    const name = typeof cat?.name === 'string' ? cat.name : '';
    return name.toLowerCase();
};

export default function ProductsPage() {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [cats, setCats] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sp, setSp] = useSearchParams();
    const activeCategory = sp.get('category') ?? '';
    const urlSearch = sp.get('search') ?? '';
    const urlPage = Math.max(1, Number(sp.get('page') ?? '1') || 1); // ← página desde URL

    const [q, setQ] = useState(urlSearch);
    const [sort, setSort] = useState<SortKey>('popular');

    // tamaño de página (estado local)
    const [perPage] = useState(15);

    useEffect(() => setQ(urlSearch), [urlSearch]);

    // Cargar categorías para el dropdown central
    useEffect(() => {
        (async () => {
            try { setCats(await fetchCategories()); } catch { /* ignore */ }
        })();
    }, []);

    const getErrorMessage = (e: unknown): string => {
        if (e instanceof Error) return e.message;
        if (typeof e === 'string') return e;
        try { return JSON.stringify(e); } catch { return 'Error cargando productos'; }
    };

    const load = async (search?: string, category?: string, page?: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchProducts({
                search,
                category,
                page,
                per_page: perPage,
            }) as ProductsResponse;
            setData(res);
        } catch (e: unknown) {
            setError(getErrorMessage(e));
            setData({
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: perPage,
                total: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load(urlSearch || undefined, activeCategory || undefined, urlPage);
    }, [activeCategory, urlSearch, urlPage, perPage]);

    // Ordenamiento en cliente (si tu API no ordena)
    const sorted = useMemo(() => {
        if (!data) return [];
        const list = [...data.data];
        if (sort === 'price_asc') list.sort((a, b) => getPrice(a) - getPrice(b));
        if (sort === 'price_desc') list.sort((a, b) => getPrice(b) - getPrice(a));
        return list;
    }, [data, sort]);

    // Métricas visuales
    const totals = useMemo(() => {
        const items = data?.data ?? [];
        const by = (needle: string) => items.filter(p => getCategoryName(p).includes(needle)).length;
        return {
            total: items.length,
            consolas: by('consol'),
            accesorios: by('acces'),
            juegos: by('jueg'),
        };
    }, [data]);

    const runSearch = () => {
        const next = new URLSearchParams(sp);
        if (q) next.set('search', q); else next.delete('search');
        next.delete('page'); // ← reset a página 1
        setSp(next, { replace: true });
    };

    const setPage = (next: number) => {
        const params = new URLSearchParams(sp);
        if (next <= 1) params.delete('page'); else params.set('page', String(next));
        setSp(params, { replace: true });
    };

    const categoryOptions: Option[] = useMemo(
        () => [{ label: 'Todas las categorías', value: '' }, ...cats.map(c => ({ label: c.name, value: c.slug }))],
        [cats]
    );

    const sortOptions: Option[] = [
        { label: 'Ordenar por', value: 'popular' },
        { label: 'Precio: menor a mayor', value: 'price_asc' },
        { label: 'Precio: mayor a menor', value: 'price_desc' },
    ];

    const canPrev = (data?.current_page ?? 1) > 1;
    const canNext = (data?.current_page ?? 1) < (data?.last_page ?? 1);
    const from = data && data.total > 0 ? (data.current_page - 1) * data.per_page + 1 : 0;
    const to = data ? Math.min(data.current_page * data.per_page, data.total) : 0;

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-6xl mx-auto p-4">
                <div className="md:grid md:grid-cols-[16rem_1fr] md:gap-6">
                    {/* Sidebar */}
                    <CategorySidebar />

                    {/* Main */}
                    <main className="space-y-6">
                        {/* HERO */}
                        <section
                            className="rounded-[20px] px-8 py-6 text-white
                         bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                         shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                         border border-white/10"
                        >
                            <h2 className="text-center text-2xl font-extrabold tracking-wider">
                                Bienvenido a Pixel Retro Store
                            </h2>
                            <p className="mt-2 text-center text-white/90 text-sm">
                                La tienda donde la nostalgia gamer cobra vida. ¡Explora clásicos y ediciones limitadas!
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
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total productos', val: totals.total },
                                { label: 'Consolas', val: totals.consolas },
                                { label: 'Accesorios', val: totals.accesorios },
                                { label: 'Juegos', val: totals.juegos },
                            ].map((s) => (
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
                                    placeholder="Buscar producto..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                                />
                            </div>

                            {/* Categorías */}
                            <FancySelect
                                className="min-w-[180px]"
                                value={activeCategory}
                                onChange={(slug) => {
                                    const next = new URLSearchParams(sp);
                                    if (slug) next.set('category', slug); else next.delete('category');
                                    next.delete('page'); // reset a página 1
                                    setSp(next, { replace: true });
                                }}
                                options={categoryOptions}
                            />

                            {/* Orden */}
                            <FancySelect
                                className="min-w-[160px]"
                                value={sort}
                                onChange={(v) => setSort(v as SortKey)}
                                options={sortOptions}
                            />

                            {/* Botón buscar */}
                            <button
                                onClick={runSearch}
                                className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                                shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)] hover:brightness-110"
                            >
                                Buscar
                            </button>
                        </section>

                        {/* RESULTADOS */}
                        {error && <p className="text-red-400">{error}</p>}
                        {loading && <p className="text-white/70">Cargando…</p>}

                        {!loading && data && (
                            <>
                                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {sorted.map((p) => (
                                        <ProductCard key={p.id} p={p} />
                                    ))}
                                    {sorted.length === 0 && (
                                        <p className="col-span-full text-white/70">Sin resultados.</p>
                                    )}
                                </section>

                                {/* Paginación */}
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
                                            onClick={() => setPage(Math.max(1, urlPage - 1))}
                                            disabled={!canPrev}
                                            className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                                ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                            title="Anterior"
                                        >
                                            ‹ Anterior
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.min(data.last_page, urlPage + 1))}
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
                    </main>
                </div>
            </div>
        </div>
    );
}
