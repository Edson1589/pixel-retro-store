// src/pages/admin/AdminProductsList.tsx
import { useEffect, useState } from 'react';
import { listProducts } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Product } from '../../../types';

type ListResponse<T> = { data: T[] }; // ajusta si tu API incluye meta/links

export default function AdminProductsList() {
    const [data, setData] = useState<ListResponse<Product>>({ data: [] });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const r = await listProducts(); // Promise<ListResponse<Product>>
            setData(r);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold">Productos</h2>
                <Link to="/admin/products/new" className="ml-auto px-3 py-2 rounded-xl bg-black text-white">
                    Nuevo producto
                </Link>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">#</th>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2">Precio</th>
                            <th className="p-2">Stock</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((p: Product) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-2">{p.id}</td>
                                <td className="p-2">{p.name}</td>
                                <td className="p-2 text-center">Bs. {Number(p.price).toFixed(2)}</td>
                                <td className="p-2 text-center">{p.stock}</td>
                                <td className="p-2 text-center">{p.status}</td>
                                <td className="p-2 text-center">
                                    <Link className="underline mr-2" to={`/admin/products/${p.id}`}>Ver</Link>
                                    <Link className="underline mr-2" to={`/admin/products/${p.id}/edit`}>Editar</Link>
                                    <Link className="underline" to={`/admin/products/${p.id}/delete`}>Eliminar</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
