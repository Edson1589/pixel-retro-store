// src/pages/admin/categories/AdminCategoryEdit.tsx
import { useEffect, useState } from 'react';
import { getCategory, updateCategory } from '../../../services/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryForm from './CategoryForm';
import type { Category } from '../../../types';

export default function AdminCategoryEdit() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [c, setC] = useState<Category | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const cid = Number(id);
        if (!id || Number.isNaN(cid)) return;

        let cancelled = false;
        (async () => {
            const cat = await getCategory(cid); // Promise<Category>
            if (!cancelled) setC(cat);
        })();

        return () => { cancelled = true; };
    }, [id]);

    const submit = async (payload: Pick<Category, 'name' | 'slug'>) => {
        const cid = Number(id);
        if (!id || Number.isNaN(cid)) return;

        try {
            setBusy(true);
            await updateCategory(cid, payload); // Promise<void> o Promise<Category>
            nav(`/admin/categories/${cid}`);
        } finally {
            setBusy(false);
        }
    };

    if (!c) return <p>Cargando...</p>;

    return (
        <div>
            <h2 className="text-lg font-bold mb-3">Editar categoría · #{c.id}</h2>
            <CategoryForm initial={c} onSubmit={submit} submitLabel={busy ? 'Guardando...' : 'Guardar cambios'} />
        </div>
    );
}
