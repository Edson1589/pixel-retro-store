import { useEffect, useState } from 'react';
import { getProduct } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../../../types';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Image as ImageIcon,
    Tag,
    Hash,
    Boxes,
    Activity,
    FileText,
    Sparkles,
    Edit3,
    Trash2,
} from 'lucide-react';

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

export default function AdminProductShow() {
    const { id } = useParams<{ id: string }>();
    const [p, setP] = useState<Product | null>(null);
    const navigate = useNavigate();
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
            ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-emerald-400/20 text-emerald-300 bg-emerald-500/15'
            : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-white/15 text-white/70 bg-white/10';

    const condPill =
        p.condition === 'new'
            ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-cyan-400/20 text-cyan-300 bg-cyan-500/15'
            : p.condition === 'used'
                ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-amber-400/20 text-amber-300 bg-amber-500/15'
                : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-violet-400/20 text-violet-300 bg-violet-500/15';

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                        >
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Producto · {p.name}
                            </h2>
                            <p className="text-xs text-white/60">
                                Resumen de la ficha, inventario y estado de publicación.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15 text-sm"
                        >
                            <Edit3 className="h-4 w-4" />
                            <span>Editar</span>
                        </Link>
                        <Link
                            to={`/admin/products/${p.id}/delete`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15 text-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>

                <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-40">
                            <div className="aspect-square rounded-xl bg-white/[0.03] border border-white/10 grid place-items-center overflow-hidden">
                                {p.image_url ? (
                                    <img
                                        src={p.image_url}
                                        alt={p.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-xs text-white/50 gap-1">
                                        <ImageIcon className="h-5 w-5" />
                                        <span>Sin imagen</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-center">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                                    Precio
                                </div>
                                <div className="text-2xl font-bold text-[#06B6D4] tabular-nums">
                                    {money.format(Number(p.price || 0))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-sm font-semibold text-white/90">
                                        {p.name}
                                    </div>
                                    <div className="text-[11px] text-white/50">
                                        ID: #{p.id} {p.slug && <span>· {p.slug}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                {p.category?.name && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/80">
                                        <Tag className="h-3 w-3" />
                                        <span>{p.category.name}</span>
                                    </span>
                                )}
                                {p.sku && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/70">
                                        <Hash className="h-3 w-3" />
                                        <span>SKU: {p.sku}</span>
                                    </span>
                                )}
                                <span className={condPill}>
                                    <Sparkles className="h-3 w-3" />
                                    <span>
                                        {p.condition === 'new'
                                            ? 'Nuevo'
                                            : p.condition === 'used'
                                                ? 'Usado'
                                                : 'Reacondicionado'}
                                    </span>
                                </span>
                                <span className={statusPill}>
                                    <Activity className="h-3 w-3" />
                                    <span>{p.status === 'active' ? 'Activo' : 'Borrador'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                            <Hash className="h-4 w-4 text-white/50" />
                            <div>
                                <div className="text-[11px] uppercase tracking-wide text-white/55">
                                    Slug
                                </div>
                                <div className="font-medium break-all">{p.slug}</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-emerald-300" />
                            <div>
                                <div className="text-[11px] uppercase tracking-wide text-white/55">
                                    Stock
                                </div>
                                <div className="font-medium">{p.stock}</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-cyan-300" />
                            <div>
                                <div className="text-[11px] uppercase tracking-wide text-white/55">
                                    Categoría
                                </div>
                                <div className="font-medium">{p.category?.name ?? '—'}</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-violet-300" />
                            <div>
                                <div className="text-[11px] uppercase tracking-wide text-white/55">
                                    Estado
                                </div>
                                <div className="font-medium">
                                    <span className={statusPill}>
                                        <Activity className="h-3 w-3" />
                                        <span>{p.status === 'active' ? 'Activo' : 'Borrador'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-white/60" />
                            <span className="text-xs text-white/60">Descripción</span>
                        </div>
                        <p className="text-sm text-white/80 whitespace-pre-wrap">
                            {p.description ?? '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
