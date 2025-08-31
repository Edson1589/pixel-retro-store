// src/pages/admin/AdminProductDelete.tsx
import { useEffect, useState } from 'react';
import { deleteProduct, getProduct } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product } from '../../../types';

export default function AdminProductDelete() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    // 👇 Nada de any
    const [p, setP] = useState<Product | null>(null);
    const [busy, setBusy] = useState(false);

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

    const doDelete = async () => {
        const pid = Number(id);
        if (!id || Number.isNaN(pid)) return;

        try {
            setBusy(true);
            await deleteProduct(pid);
            nav('/admin/products');
        } finally {
            setBusy(false);
        }
    };

    if (!p) return <p>Cargando...</p>;

    return (
        <div className="max-w-xl">
            <h2 className="text-lg font-bold mb-4">Eliminar producto</h2>
            <p>
                ¿Seguro que deseas eliminar <b>{p.name}</b> (#{p.id})? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-4">
                <button
                    disabled={busy}
                    onClick={doDelete}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white"
                >
                    {busy ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <Link to={`/admin/products/${p.id}`} className="px-4 py-2 rounded-xl border">
                    Cancelar
                </Link>
            </div>
        </div>
    );
}
