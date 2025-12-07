import { signalInteract } from '../services/telemetry';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import {
    Home,
    ChevronRight,
    Package2,
    Tag,
    Hash,
    Boxes,
    Sparkles,
    ShoppingCart,
    ArrowLeft,
    Info,
} from 'lucide-react';

const API_BASE =
    (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + '/api';
const money = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
});

const prefer = (id: number) => {
    const url = `${API_BASE}/products/${id}/prefer`;
    if ('sendBeacon' in navigator) {
        navigator.sendBeacon(
            url,
            new Blob([JSON.stringify({})], { type: 'application/json' }),
        );
    } else {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        }).catch(() => { });
    }
};

export default function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const nav = useNavigate();
    const { add } = useCart();
    const sentView = useRef(false);
    const [p, setP] = useState<Product | null>(null);
    const [qty, setQty] = useState(1);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (p?.id && !sentView.current) {
            sentView.current = true;
            void signalInteract(p.id, 'view');
        }
    }, [p?.id]);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const data = await fetchProduct(slug);
                setP(data);
            } catch (e: unknown) {
                setErr(e instanceof Error ? e.message : 'Error cargando producto');
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07101B]">
                <div className="max-w-5xl mx-auto p-4">
                    <p className="text-white/70">Cargando…</p>
                </div>
            </div>
        );
    }

    if (err || !p) {
        return (
            <div className="min-h-screen bg-[#07101B]">
                <div className="max-w-5xl mx-auto p-4 space-y-3 text-white">
                    <p className="text-rose-300 mb-1">{err ?? 'Producto no encontrado'}</p>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15
                                   bg-white/[0.06] text-white hover:bg-white/[0.12]"
                        onClick={() => nav(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>
            </div>
        );
    }

    const price = Number(p.price) || 0;
    const inStock = (p.stock ?? 0) > 0;
    const outOfStock = !inStock;

    const condPillBase =
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border';
    const condPillClass =
        p.condition === 'new'
            ? `${condPillBase} border-emerald-400/30 text-emerald-300 bg-emerald-500/15`
            : p.condition === 'used'
                ? `${condPillBase} border-amber-400/30 text-amber-300 bg-amber-500/15`
                : `${condPillBase} border-violet-400/30 text-violet-300 bg-violet-500/15`;

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-5xl mx-auto p-4 space-y-5 text-white">
                <nav className="text-xs sm:text-sm flex flex-wrap items-center gap-1 text-white/70">
                    <Home className="h-4 w-4 text-white/50" />
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1 text-[#06B6D4] hover:underline"
                    >
                        <span>Inicio</span>
                    </Link>
                    <ChevronRight className="h-3 w-3 text-white/40" />
                    {p.category?.slug ? (
                        <Link
                            to={`/?category=${p.category.slug}`}
                            className="inline-flex items-center gap-1 text-[#06B6D4] hover:underline"
                        >
                            <Package2 className="h-3 w-3 text-white/50" />
                            <span>{p.category?.name ?? 'Categoría'}</span>
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-white/70">
                            <Package2 className="h-3 w-3 text-white/50" />
                            <span>{p.category?.name ?? 'Sin categoría'}</span>
                        </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-white/40" />
                    <span className="font-medium text-white/90 truncate max-w-[180px] sm:max-w-xs">
                        {p.name}
                    </span>
                </nav>

                <div className="grid md:grid-cols-3 gap-5">
                    <div
                        className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] p-3
                                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
                    >
                        <div className="aspect-square rounded-xl bg-[#050814] border border-white/10 grid place-items-center overflow-hidden relative">
                            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.4),transparent_55%)]" />
                            {p.image_url ? (
                                <img
                                    src={p.image_url}
                                    alt={p.name}
                                    className="relative z-10 w-full h-full object-contain p-4"
                                />
                            ) : (
                                <span className="relative z-10 text-sm text-white/50">
                                    Sin imagen
                                </span>
                            )}

                            <div className="absolute left-3 top-3">
                                <span className={condPillClass}>
                                    <Tag className="h-3 w-3" />
                                    {p.condition === 'new'
                                        ? 'Nuevo'
                                        : p.condition === 'used'
                                            ? 'Usado'
                                            : 'Reacondicionado'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                                    Precio
                                </div>
                                <div className="text-2xl font-bold text-[#06B6D4]">
                                    {money.format(price)}
                                </div>
                            </div>

                            <div className="text-right space-y-1">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                                                border border-white/15 bg-white/5 text-white/70">
                                    <Boxes className="h-3 w-3" />
                                    <span>Stock: {p.stock}</span>
                                </div>
                                {p.is_unique && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                                                    border border-[#06B6D4] text-[#06B6D4]/95 bg-[#06B6D4]/10">
                                        <Sparkles className="h-3 w-3" />
                                        <span>Pieza única</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5
                                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]
                                   space-y-5"
                    >
                        <div className="space-y-2">
                            <div
                                className="text-xl sm:text-2xl font-extrabold tracking-wider bg-clip-text text-transparent
                                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                            >
                                {p.name}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                                {p.category?.name && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/80">
                                        <Package2 className="h-3 w-3" />
                                        <span>{p.category.name}</span>
                                    </span>
                                )}
                                {p.sku && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/70">
                                        <Hash className="h-3 w-3" />
                                        <span>SKU: {p.sku}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="h-4 w-4 text-[#06B6D4]" />
                                <span className="text-xs font-semibold text-white/70">
                                    Descripción del producto
                                </span>
                            </div>
                            <p className="text-sm text-white/80 whitespace-pre-wrap">
                                {p.description ?? 'Sin descripción disponible.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                            <label className="block">
                                <span className="block text-[11px] text-white/60 mb-1">
                                    Cantidad
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    max={p.is_unique ? 1 : p.stock}
                                    value={qty}
                                    onChange={(e) => {
                                        const max = p.is_unique ? 1 : p.stock;
                                        const v = Math.max(
                                            1,
                                            Math.min(max, Number(e.target.value) || 1),
                                        );
                                        setQty(v);
                                    }}
                                    className="w-24 rounded-xl px-3 py-2
                                               bg-white/[0.05] text-white/90 border border-white/10
                                               focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                />
                            </label>

                            <button
                                disabled={outOfStock}
                                onClick={() => {
                                    add(p, qty);
                                    prefer(p.id);
                                    void signalInteract(p.id, 'add');
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white
                                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                                           hover:brightness-110 active:scale-[0.99] transition
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                <span>{outOfStock ? 'Sin stock' : 'Agregar al carrito'}</span>
                            </button>

                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white
                                           bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Seguir comprando</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
