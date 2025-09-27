import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import ErrorCard from '../components/ErrorCard';
import CartErrorToast from '../components/CartErrorToast';

type ProductsResponse = { data: Product[] };

export default function ProductsPage() {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sp, setSp] = useSearchParams();
    const activeCategory = sp.get('category') ?? undefined;
    const urlSearch = sp.get('search') ?? '';

    const [q, setQ] = useState(urlSearch);

    const { cartError } = useCart();


    useEffect(() => {
        setQ(urlSearch);
    }, [urlSearch]);

    const getErrorMessage = (e: unknown): string => {
        if (e instanceof Error) return e.message;
        if (typeof e === 'string') return e;
        try { return JSON.stringify(e); } catch { return 'Error cargando productos'; }
    };

    const load = async (search?: string, category?: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchProducts({ search, category }) as ProductsResponse;
            setData(res);
        } catch (e: unknown) {
            setError(getErrorMessage(e));
            setData({ data: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load(urlSearch || undefined, activeCategory);
    }, [activeCategory, urlSearch]);

    const runSearch = () => {
        const next = new URLSearchParams(sp);
        if (q) next.set('search', q); else next.delete('search');
        next.delete('page');
        setSp(next, { replace: true });
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <header className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold">Pixel Retro Store</h1>
                <div className="ml-auto flex gap-2">
                    <input
                        className="border rounded-xl px-3 py-2"
                        placeholder="Buscar..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runSearch()}
                    />
                    <button onClick={runSearch} className="px-3 py-2 rounded-xl border">Buscar</button>
                </div>
            </header>

            <div className="md:grid md:grid-cols-[16rem_1fr] md:gap-4">
                <CategorySidebar />

                <main>
                     <CartErrorToast />
                    {activeCategory && (
                        <div className="text-sm text-gray-600 mb-3">
                            Filtrando por categoría: <b>{activeCategory}</b>
                        </div>
                    )}

                    {error && <p className="text-red-600 mb-2">{error}</p>}
                    {loading && <p>Cargando...</p>}
                    {!loading && data && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {data.data.map(p => <ProductCard key={p.id} p={p} />)}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
