import { useEffect, useState } from 'react';
import { deleteCategory, getCategory } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Category } from '../../../types';

export default function AdminCategoryDelete() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [c, setC] = useState<Category | null>(null);
    const [busy, setBusy] = useState(false);

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

    const doDelete = async () => {
        const cid = Number(id);
        if (!id || Number.isNaN(cid)) return;

        try {
            setBusy(true);
            await deleteCategory(cid);
            nav('/admin/categories');
        } finally {
            setBusy(false);
        }
    };

    if (!c) return <p>Cargando...</p>;

    return (
        <div className="max-w-xl">
            <h2 className="text-lg font-bold mb-4">Eliminar categoría</h2>
            <p>
                ¿Seguro que deseas eliminar <b>{c.name}</b> (#{c.id})? Los productos quedarán sin categoría.
            </p>
            <div className="flex gap-2 mt-4">
                <button
                    disabled={busy}
                    onClick={doDelete}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white"
                >
                    {busy ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <Link to={`/admin/categories/${c.id}`} className="px-4 py-2 rounded-xl border">
                    Cancelar
                </Link>
            </div>
        </div>
    );
}
