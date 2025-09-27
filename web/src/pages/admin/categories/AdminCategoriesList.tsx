import { useEffect, useState } from 'react';
import { listCategories } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Category } from '../../../types';

type ListResponse<T> = { data: T[] };

export default function AdminCategoriesList() {
    const [data, setData] = useState<ListResponse<Category>>({ data: [] });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await listCategories();
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold">Categorías</h2>
                <Link to="/admin/categories/new" className="ml-auto px-3 py-2 rounded-xl bg-black text-white">
                    Nueva categoría
                </Link>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2">Slug</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((c) => (
                            <tr key={c.id} className="border-t">
                                <td className="p-2">{c.name}</td>
                                <td className="p-2 text-center">{c.slug}</td>
                                <td className="p-2 text-center">
                                    <Link className="underline mr-2" to={`/admin/categories/${c.id}`}>Ver</Link>
                                    <Link className="underline mr-2" to={`/admin/categories/${c.id}/edit`}>Editar</Link>
                                    <Link className="underline" to={`/admin/categories/${c.id}/delete`}>Eliminar</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
