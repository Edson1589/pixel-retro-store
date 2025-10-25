import { useEffect, useState } from 'react';
import { deleteProduct, getProduct } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product } from '../../../types';

export default function AdminProductDelete() {
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

    if (!p) return <p className="text-white/70">Cargando…</p>;

    const statusPill =
        p.status === 'active'
            ? 'text-emerald-300 border-emerald-400/25 bg-emerald-500/15'
            : 'text-white/75 border-white/20 bg-white/10';

    return (
        <div className="text-white space-y-5 max-w-2xl mx-auto px-4">
            <h2
                className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                   bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
            >
                Eliminar producto
            </h2>

            <div
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/[0.06] overflow-hidden grid place-items-center">
                        {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs text-white/50">Sin img</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                    ">{p.name}</div>
                        <div className="text-sm text-white/70">Bs. {Number(p.price).toFixed(2)}</div>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${statusPill}`}>
                                {p.status === 'active' ? 'Activo' : 'Borrador'}
                            </span>
                            <span className="text-xs text-white/60">Stock: {p.stock}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
                    <div className="text-sm">
                        ¿Seguro que deseas eliminar <b>{p.name}</b> (#{p.id})?{' '}
                        <span className="text-rose-200 font-medium">Esta acción no se puede deshacer.</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        disabled={busy}
                        onClick={doDelete}
                        className="px-4 py-2 rounded-xl text-white
                       bg-rose-600 hover:bg-rose-500 disabled:opacity-60
                       shadow-[0_12px_30px_-12px_rgba(225,29,72,0.6)]"
                    >
                        {busy ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                    <Link
                        to={`/admin/products/${p.id}`}
                        className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Cancelar
                    </Link>
                </div>
            </div>
        </div>
    );
}
