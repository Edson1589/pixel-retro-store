import { useEffect, useState } from 'react';
import { getCategory } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import type { Category } from '../../../types';

type CategoryView = Category & { products_count?: number };

export default function AdminCategoryShow() {
    const { id } = useParams<{ id: string }>();
    const [c, setC] = useState<CategoryView | null>(null);

    useEffect(() => {
        const cid = Number(id);
        if (!id || Number.isNaN(cid)) return;

        let cancelled = false;
        (async () => {
            const cat = await getCategory(cid);
            if (!cancelled) setC(cat);
        })();

        return () => { cancelled = true; };
    }, [id]);

    if (!c) return <p>Cargando...</p>;

    return (
        <div className="max-w-2xl">
            <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold">Categoría · #{c.id}</h2>
                <div className="ml-auto flex gap-2">
                    <Link to={`/admin/categories/${c.id}/edit`} className="px-3 py-2 rounded-xl border">Editar</Link>
                    <Link to={`/admin/categories/${c.id}/delete`} className="px-3 py-2 rounded-xl border">Eliminar</Link>
                    <Link to="/admin/categories" className="px-3 py-2 rounded-xl border">Volver</Link>
                </div>
            </div>

            <div className="space-y-2">
                <div><span className="text-gray-500">Nombre:</span> <b>{c.name}</b></div>
                <div><span className="text-gray-500">Slug:</span> {c.slug}</div>
                {c.products_count !== undefined && (
                    <div>
                        <span className="text-gray-500">Productos asociados:</span> {c.products_count}
                    </div>
                )}
            </div>
        </div>
    );
}
