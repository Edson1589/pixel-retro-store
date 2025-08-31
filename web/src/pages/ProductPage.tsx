import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { Link } from 'react-router-dom';

type ProductsResponse = { data: Product[] };

export default function ProductsPage() {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getErrorMessage = (e: unknown): string => {
        if (e instanceof Error) return e.message;
        if (typeof e === 'string') return e;
        try { return JSON.stringify(e); } catch { return 'Error cargando productos'; }
    };

    const load = async (search?: string) => {
        setLoading(true);
        setError(null);
        try {
            // Ideal: tipa fetchProducts para que ya devuelva Promise<ProductsResponse>
            const res = await fetchProducts({ search }) as ProductsResponse;
            setData(res);
        } catch (e: unknown) {
            setError(getErrorMessage(e));
            setData({ data: [] }); // ya coincide con ProductsResponse, sin "as any"
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

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
                    />
                    <button onClick={() => load(q)} className="px-3 py-2 rounded-xl border">Buscar</button>
                    <Link to="/cart" className="px-3 py-2 rounded-xl border">Carrito</Link>
                </div>
            </header>

            {error && <p className="text-red-600 mb-2">{error}</p>}
            {loading && <p>Cargando...</p>}
            {!loading && data && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.data.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
            )}
        </div>
    );
}
