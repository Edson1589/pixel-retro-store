import { signalInteract } from '../services/telemetry';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + '/api';
const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

const prefer = (id: number) => {
    const url = `${API_BASE}/products/${id}/prefer`;
    if ('sendBeacon' in navigator) {
        navigator.sendBeacon(url, new Blob([JSON.stringify({})], { type: 'application/json' }));
    } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => { });
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
                <div className="max-w-5xl mx-auto p-4">
                    <p className="text-rose-300 mb-4">{err ?? 'Producto no encontrado'}</p>
                    <button
                        className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                        onClick={() => nav(-1)}
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const price = Number(p.price) || 0;
    const inStock = (p.stock ?? 0) > 0;
    const outOfStock = !inStock;

    const condPill =
        p.condition === 'new'
            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-cyan-400/20 text-cyan-300 bg-cyan-500/15'
            : p.condition === 'used'
                ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-amber-400/20 text-amber-300 bg-amber-500/15'
                : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-violet-400/20 text-violet-300 bg-violet-500/15';

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-5xl mx-auto p-4 space-y-5 text-white">
                <nav className="text-sm">
                    <Link to="/" className="text-[#06B6D4] hover:underline">Inicio</Link>
                    <span className="text-white/40"> / </span>
                    {p.category?.slug ? (
                        <Link to={`/?category=${p.category.slug}`} className="text-[#06B6D4] hover:underline">
                            {p.category?.name ?? 'Categoría'}
                        </Link>
                    ) : (
                        <span className="text-white/70">{p.category?.name ?? 'Sin categoría'}</span>
                    )}
                    <span className="text-white/40"> / </span>
                    <span className="font-medium">{p.name}</span>
                </nav>

                <div className="grid md:grid-cols-3 gap-5">
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] p-3
                          shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]">
                        <div className="aspect-square rounded-xl bg-white/[0.03] border border-white/10 grid place-items-center overflow-hidden relative">
                            <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(closest-side,rgba(124,58,237,0.25),transparent_70%)]" />
                            {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="relative z-10 w-full h-full object-contain p-4" />
                            ) : (
                                <span className="relative z-10 text-sm text-white/50">Sin imagen</span>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <div className="text-xs uppercase tracking-widest text-white/60">Precio</div>
                            <div className="text-2xl font-bold text-[#06B6D4]">{money.format(price)}</div>
                        </div>
                    </div>

                    <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5
                          shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-5">

                        <div>
                            <div className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                              bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                                {p.name}
                            </div>
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
                                    {p.condition === 'new' ? 'Nuevo' : p.condition === 'used' ? 'Usado' : 'Reacondicionado'}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/15 bg-white/10 text-white/80">
                                    Stock: <b className="ml-1">{p.stock}</b>
                                </span>
                                {p.is_unique && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]
                                   border border-[#06B6D4] text-[#06B6D4]/95">
                                        Pieza única
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs text-white/60 mb-1">Descripción</div>
                            <p className="text-white/80 whitespace-pre-wrap">{p.description ?? '—'}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="block">
                                <span className="sr-only">Cantidad</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={p.is_unique ? 1 : p.stock}
                                    value={qty}
                                    onChange={(e) => {
                                        const max = p.is_unique ? 1 : p.stock;
                                        const v = Math.max(1, Math.min(max, Number(e.target.value) || 1));
                                        setQty(v);
                                    }}
                                    className="w-24 rounded-xl px-3 py-2
                             bg-white/[0.05] text-white/90 border border-white/10
                             focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                />
                            </label>

                            <button
                                disabled={outOfStock}
                                onClick={() => { add(p, qty); prefer(p.id); void signalInteract(p.id, 'add'); }}
                                className="px-5 py-2.5 rounded-xl font-medium text-white
                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 active:scale-[0.99] transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                            </button>

                            <Link
                                to="/"
                                className="px-5 py-2.5 rounded-xl font-medium text-white
                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 active:scale-[0.99] transition"
                            >
                                ← Seguir comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
