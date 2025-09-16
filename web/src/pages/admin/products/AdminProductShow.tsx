import { useEffect, useState } from 'react';
import { getProduct } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../../../types';

export default function AdminProductShow() {
    const { id } = useParams<{ id: string }>();
    const [p, setP] = useState<Product | null>(null);

    useEffect(() => {
        const pid = Number(id);
        if (!id || Number.isNaN(pid)) return;

        let cancelled = false;
        (async () => {
            const prod = await getProduct(pid);
            if (!cancelled) setP(prod);
        })();

        return () => { cancelled = true; };
    }, [id]);

    if (!p) return <p>Cargando...</p>;

    return (
        <div>
            <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold">Producto · #{p.id}</h2>
                <div className="ml-auto flex gap-2">
                    <Link to={`/admin/products/${p.id}/edit`} className="px-3 py-2 rounded-xl border">Editar</Link>
                    <Link to={`/admin/products/${p.id}/delete`} className="px-3 py-2 rounded-xl border">Eliminar</Link>
                    <Link to="/admin/products" className="px-3 py-2 rounded-xl border">Volver</Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                        {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="max-h-full object-contain" />
                            : <span className="text-sm text-gray-500">Sin imagen</span>}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <div><span className="text-gray-500">Nombre:</span> <b>{p.name}</b></div>
                    <div><span className="text-gray-500">Slug:</span> {p.slug}</div>
                    <div><span className="text-gray-500">SKU:</span> {p.sku ?? '—'}</div>
                    <div><span className="text-gray-500">Categoría:</span> {p.category?.name ?? '—'}</div>
                    <div><span className="text-gray-500">Precio:</span> Bs. {Number(p.price).toFixed(2)}</div>
                    <div><span className="text-gray-500">Stock:</span> {p.stock}</div>
                    <div><span className="text-gray-500">Condición:</span> {p.condition}</div>
                    <div><span className="text-gray-500">Estado:</span> {p.status}</div>
                    <div className="text-gray-500">Descripción:</div>
                    <p>{p.description ?? '—'}</p>
                </div>
            </div>
        </div>
    );
}
