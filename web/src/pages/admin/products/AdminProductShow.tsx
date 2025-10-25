import { useEffect, useState } from 'react';
import { getProduct } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../../../types';

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

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

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!p) return <p className="text-white/70">Cargando…</p>;

    const statusPill =
        p.status === 'active'
            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-emerald-400/20 text-emerald-300 bg-emerald-500/15'
            : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/15 text-white/70 bg-white/10';

    const condPill =
        p.condition === 'new'
            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-cyan-400/20 text-cyan-300 bg-cyan-500/15'
            : p.condition === 'used'
                ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-amber-400/20 text-amber-300 bg-amber-500/15'
                : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-violet-400/20 text-violet-300 bg-violet-500/15';

    return (
        <div className="space-y-5 text-white">
            <div className="flex items-center gap-3">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                >
                    Producto · #{p.id}
                </h2>

                <div className="ml-auto flex gap-2">
                    <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="px-3 py-2 rounded-xl text-sm text-white bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                       hover:brightness-110 shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]"
                    >
                        Editar
                    </Link>
                    <Link
                        to={`/admin/products/${p.id}/delete`}
                        className="px-3 py-2 rounded-xl text-sm border border-rose-400/30 text-rose-200 bg-rose-500/10 hover:bg-rose-500/15"
                    >
                        Eliminar
                    </Link>
                    <Link
                        to="/admin/products"
                        className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
                <div
                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] p-3
                     shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
                >
                    <div className="aspect-square rounded-xl bg-white/[0.03] border border-white/10 grid place-items-center overflow-hidden">
                        {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-sm text-white/50">Sin imagen</span>
                        )}
                    </div>

                    <div className="mt-4 text-center">
                        <div className="text-xs uppercase tracking-widest text-white/60">Precio</div>
                        <div className="text-2xl font-bold text-[#06B6D4]">{money.format(Number(p.price || 0))}</div>
                    </div>
                </div>

                <div
                    className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5
                     shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-5"
                >
                    <div>
                        <div className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">{p.name}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {p.category?.name && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/80">
                                    {p.category.name}
                                </span>
                            )}
                            {p.sku && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/70">
                                    SKU: {p.sku}
                                </span>
                            )}
                            <span className={condPill}>
                                {p.condition === 'new'
                                    ? 'Nuevo'
                                    : p.condition === 'used'
                                        ? 'Usado'
                                        : 'Reacondicionado'}
                            </span>
                            <span className={statusPill}>{p.status === 'active' ? 'Activo' : 'Borrador'}</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs text-white/60">Slug</div>
                            <div className="mt-0.5 text-white/90">{p.slug}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs text-white/60">Stock</div>
                            <div className="mt-0.5 text-white/90">{p.stock}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs text-white/60">Categoría</div>
                            <div className="mt-0.5 text-white/90">{p.category?.name ?? '—'}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs text-white/60">Estado</div>
                            <div className="mt-0.5">
                                <span className={statusPill}>{p.status === 'active' ? 'Activo' : 'Borrador'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/60 mb-1">Descripción</div>
                        <p className="text-white/80 whitespace-pre-wrap">{p.description ?? '—'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
