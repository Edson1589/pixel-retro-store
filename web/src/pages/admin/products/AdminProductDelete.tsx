import { useEffect, useState } from 'react';
import { deleteProduct, getProduct } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product } from '../../../types';
import {
    ArrowLeft,
    Trash2,
    AlertTriangle,
    Tag,
    Hash,
    Barcode,
    Boxes,
    BadgeDollarSign,
    PackageCheck
} from 'lucide-react';

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

    const condPill =
        p.condition === 'new'
            ? 'text-cyan-300 border-cyan-400/25 bg-cyan-500/15'
            : p.condition === 'used'
                ? 'text-amber-300 border-amber-400/25 bg-amber-500/15'
                : 'text-violet-300 border-violet-400/25 bg-violet-500/15';

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
               bg-[linear-gradient(135deg,#f97373_0%,#fb7185_40%,#7C3AED_100%)]
               shadow-[0_12px_30px_-14px_rgba(248,113,113,0.75)]
               flex items-center justify-center"
                        >
                            <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#fb7185_0%,#f97316_40%,#facc15_100%)]">
                                Eliminar producto
                            </h2>
                            <p className="text-xs text-white/60">
                                Esta acción no se puede deshacer. Revisa bien antes de confirmar.
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
             border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
                </div>

                <div
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5
           shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4"
                >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-full sm:w-32 aspect-square rounded-xl border border-white/10 bg-white/[0.06] overflow-hidden grid place-items-center">
                            {p.image_url ? (
                                <img
                                    src={p.image_url}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-white/50">Sin imagen</span>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="text-lg font-semibold text-white/90">
                                {p.name}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/80">
                                    <BadgeDollarSign className="h-3 w-3" />
                                    <span>Bs. {Number(p.price).toFixed(2)}</span>
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${statusPill}`}
                                >
                                    <PackageCheck className="h-3 w-3" />
                                    <span>{p.status === 'active' ? 'Activo' : 'Borrador'}</span>
                                </span>

                                {p.condition && (
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${condPill}`}
                                    >
                                        <Boxes className="h-3 w-3" />
                                        <span>
                                            {p.condition === 'new'
                                                ? 'Nuevo'
                                                : p.condition === 'used'
                                                    ? 'Usado'
                                                    : 'Reacondicionado'}
                                        </span>
                                    </span>
                                )}

                                {p.category?.name && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 text-[11px] text-white/80">
                                        <Tag className="h-3 w-3" />
                                        <span>{p.category.name}</span>
                                    </span>
                                )}

                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/15 bg-white/5 text-[11px] text-white/80">
                                    <Boxes className="h-3 w-3" />
                                    <span>Stock: {p.stock}</span>
                                </span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 pt-2 text-sm">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <Hash className="h-3 w-3" />
                                        <span>Slug</span>
                                    </div>
                                    <div className="text-white/90 break-all">{p.slug}</div>
                                </div>

                                {p.sku && (
                                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs text-white/60">
                                            <Barcode className="h-3 w-3" />
                                            <span>SKU</span>
                                        </div>
                                        <div className="text-white/90 break-all">{p.sku}</div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-200 mt-0.5" />
                        <div className="text-sm">
                            ¿Seguro que deseas eliminar <b>{p.name}</b> (#{p.id})?{' '}
                            <span className="text-rose-200 font-medium">
                                Esta acción no se puede deshacer.
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={doDelete}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
               border border-rose-400/60 bg-rose-600/90 hover:bg-rose-500 text-sm
               shadow-[0_12px_30px_-12px_rgba(225,29,72,0.6)]
               disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{busy ? 'Eliminando…' : 'Sí, eliminar'}</span>
                        </button>

                        <Link
                            to={`/admin/products/${p.id}`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
               border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancelar</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

}
