import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const price =
    typeof p.price === 'number' ? p.price : parseFloat(p.price || '0');

  return (
    <div className="border rounded-2xl p-4 shadow-sm flex flex-col">
      {/* Imagen con link al detalle (por ID) */}
      <Link
        to={`/products/${p.id}`}
        className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center"
      >
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="max-h-full object-contain"
          />
        ) : (
          <span className="text-sm text-gray-500">Sin imagen</span>
        )}
      </Link>

      {/* Nombre con link al detalle (por ID) */}
      <h3 className="font-semibold text-lg">
        <Link to={`/products/${p.id}`} className="hover:underline">
          {p.name}
        </Link>
      </h3>

      <p className="text-sm text-gray-500">{p.category?.name ?? '—'}</p>
      <p className="mt-2 font-bold">Bs. {price.toFixed(2)}</p>
      <p className="text-xs text-gray-500">Stock: {p.stock}</p>

      <div className="mt-auto flex flex-col gap-2">
        <button
          disabled={p.stock < 1}
          onClick={() => addItem(p, 1)}
          className="py-2 px-3 rounded-xl bg-black text-white disabled:opacity-40"
        >
          {p.stock < 1 ? 'Sin stock' : 'Agregar al carrito'}
        </button>

        {/* Botón para ir al detalle (por ID) */}
        <Link
          to={`/products/${p.slug}`}
          className="text-center py-2 px-3 rounded-xl border hover:bg-gray-100"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
