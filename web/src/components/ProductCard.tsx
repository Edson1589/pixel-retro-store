import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductCard({ p }: { p: Product }) {
    const { add } = useCart();
    const price = typeof p.price === 'number' ? p.price : parseFloat(p.price || '0');
    return (
        <div className="border rounded-2xl p-4 shadow-sm flex flex-col">
            <div className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="max-h-full object-contain" /> : <span className="text-sm text-gray-500">Sin imagen</span>}
            </div>
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.category?.name ?? '—'}</p>
            <p className="mt-2 font-bold">Bs. {price.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Stock: {p.stock}</p>
            <button
                disabled={p.stock < 1}
                onClick={() => add(p, 1)}
                className="mt-auto py-2 px-3 rounded-xl bg-black text-white disabled:opacity-40"
            >
                {p.stock < 1 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
        </div>
    );
}
