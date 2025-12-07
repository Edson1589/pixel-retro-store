import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, type Page } from '../services/api';
import ProductCard from '../components/ProductCard';
import type { Product, Category } from '../types';
import FancySelect, { type Option } from '../components/FancySelect';
import {
    Gamepad2,
    Sparkles,
    Search,
    PackageSearch,
    Tag,
} from 'lucide-react';

type ProductsResponse = Page<Product>;
type SortKey = 'popular' | 'price_asc' | 'price_desc';


const getPrice = (p: Product): number => {
    const price = (p as { price?: number | null }).price;
    return typeof price === 'number' ? price : 0;
};

export default function ProductsPage() {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [, setCats] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sp, setSp] = useSearchParams();
    const activeCategory = sp.get('category') ?? '';
    const activeCondition = sp.get('condition') ?? '';
    const urlSearch = sp.get('search') ?? '';
    const urlPage = Math.max(1, Number(sp.get('page') ?? '1') || 1);

    const [q, setQ] = useState(urlSearch);
    const [sort, setSort] = useState<SortKey>('popular');

    const [perPage] = useState(4);

    useEffect(() => setQ(urlSearch), [urlSearch]);

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

    const load = async (search?: string, category?: string, page?: number, condition?: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchProducts({
                search,
                category,
                page,
                per_page: perPage,
                condition,
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
        void load(urlSearch || undefined, activeCategory || undefined, urlPage, activeCondition || undefined);
    }, [activeCategory, activeCondition, urlSearch, urlPage, perPage]);

    const sorted = useMemo(() => {
        if (!data) return [];
        const list = [...data.data];
        if (sort === 'price_asc') list.sort((a, b) => getPrice(a) - getPrice(b));
        if (sort === 'price_desc') list.sort((a, b) => getPrice(b) - getPrice(a));
        return list;
    }, [data, sort]);

    const runSearch = () => {
        const next = new URLSearchParams(sp);
        if (q) next.set('search', q); else next.delete('search');
        next.delete('page');
        setSp(next, { replace: true });
    };

    const setPage = (next: number) => {
        const params = new URLSearchParams(sp);
        if (next <= 1) params.delete('page'); else params.set('page', String(next));
        setSp(params, { replace: true });
    };

    const conditionOptions: Option[] = useMemo(
        () => [
            { label: 'Todas las condiciones', value: '' },
            { label: 'Nuevo', value: 'new' },
            { label: 'Usado', value: 'used' },
            { label: 'Reacondicionado', value: 'refurbished' },
        ],
        []
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
    const hasResults = !!data && (data.total ?? 0) > 0;
    const showPager = hasResults && ((data?.last_page ?? 1) > 1);

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                <section
                    className="rounded-[20px] px-8 py-6 text-white
    bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
    shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
    border border-white/10 relative overflow-hidden"
                >
                    <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15 blur-3 opacity-70" />

                    <div className="relative flex flex-col items-center text-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] tracking-[0.18em] uppercase text-white/80">
                            <Gamepad2 className="h-3 w-3" />
                            <span>Catálogo retro · Consolas, juegos y más</span>
                        </span>

                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider flex items-center gap-2">
                            <Sparkles className="h-6 w-6 hidden sm:inline" />
                            <span>Productos Pixel Retro Store</span>
                        </h2>

                        <p className="mt-1 text-white/90 text-sm max-w-xl">
                            Explora consolas clásicas, cartuchos originales y accesorios seleccionados. Todo probado,
                            limpiado y listo para volver a conectarse a tu televisor (o a tu nostalgia).
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                                <PackageSearch className="h-3 w-3" />
                                <span>Consolas, juegos y accesorios</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                                <Tag className="h-3 w-3" />
                                <span>Lotes limitados y rotativos</span>
                            </span>
                        </div>
                    </div>
                </section>

                <section id='products' className="relative z-10 flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[220px]">
                        <div className="relative">
                            <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                className="w-full rounded-xl pl-9 pr-3 py-2
        bg-white/[0.05] text-white/90 placeholder:text-white/45
        border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="Buscar producto..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                            />
                        </div>
                    </div>


                    <FancySelect
                        className="min-w-[200px]"
                        value={activeCondition}
                        onChange={(cond) => {
                            const next = new URLSearchParams(sp);
                            if (cond) next.set('condition', String(cond));
                            else next.delete('condition');
                            next.delete('page');
                            setSp(next, { replace: true });
                        }}
                        options={conditionOptions}
                    />

                    <FancySelect
                        className="min-w-[160px]"
                        value={sort}
                        onChange={(v) => setSort(v as SortKey)}
                        options={sortOptions}
                    />

                    <button
                        onClick={runSearch}
                        className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)] text-white font-medium
      shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)] hover:brightness-110 inline-flex items-center gap-2"
                    >
                        <Search className="h-4 w-4" />
                        Buscar
                    </button>
                </section>

                {error && <p className="text-red-400">{error}</p>}
                {loading && <p className="text-white/70">Cargando…</p>}

                {!loading && data && (
                    <>
                        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sorted.map((p) => (
                                <ProductCard key={p.id} p={p} currentQuery={urlSearch} />
                            ))}
                            {sorted.length === 0 && (
                                <p className="col-span-full text-white/70">Sin resultados.</p>
                            )}
                        </section>

                        {hasResults && (
                            <div className="flex flex-wrap items-center gap-3 justify-between">
                                <div className="text-white/70 text-sm">
                                    Mostrando <span className="text-white">{from}</span>–
                                    <span className="text-white">{to}</span> de{' '}
                                    <span className="text-white">{data!.total}</span>
                                    <span className="ml-3 text-white/50">
                                        Página {data!.current_page} de {data!.last_page}
                                    </span>
                                </div>

                                {showPager && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage(1)}
                                            disabled={!canPrev}
                                            className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                      ${canPrev
                                                    ? 'hover:bg-white/10'
                                                    : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            title="Primera página"
                                        >
                                            « Primero
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.max(1, urlPage - 1))}
                                            disabled={!canPrev}
                                            className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                      ${canPrev
                                                    ? 'hover:bg-white/10'
                                                    : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            title="Anterior"
                                        >
                                            ‹ Anterior
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(Math.min(data!.last_page, urlPage + 1))
                                            }
                                            disabled={!canNext}
                                            className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                      ${canNext
                                                    ? 'hover:bg-white/10'
                                                    : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            title="Siguiente"
                                        >
                                            Siguiente ›
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPage(data!.last_page)}
                                            disabled={!canNext}
                                            className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                      ${canNext
                                                    ? 'hover:bg-white/10'
                                                    : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            title="Última página"
                                        >
                                            Última »
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

}
