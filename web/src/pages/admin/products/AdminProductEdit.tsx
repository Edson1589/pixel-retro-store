import { useEffect, useState } from 'react';
import { getProduct, updateProduct } from '../../../services/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from './ProductForm';
import type { Product } from '../../../types';

export default function AdminProductEdit() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

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

        return () => {
            cancelled = true;
        };
    }, [id]);

    const submit = async (fd: FormData): Promise<void> => {
        const pid = Number(id);
        if (!id || Number.isNaN(pid)) return;

        try {
            setBusy(true);
            const saved = await updateProduct(pid, fd);
            nav(`/admin/products/${saved.id}`);
        } finally {
            setBusy(false);
        }
    };

    if (!p) return <p>Cargando...</p>;

    return (
        <div>
            <h2 className="text-lg font-bold mb-3">Editar producto · #{p.id}</h2>
            <ProductForm initial={p} onSubmit={submit} submitLabel={busy ? 'Guardando...' : 'Guardar cambios'} />
        </div>
    );
}
