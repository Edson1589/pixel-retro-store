import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const nav = useNavigate();
    const { add } = useCart();

    const [p, setP] = useState<Product | null>(null);
    const [qty, setQty] = useState(1);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
    const outOfStock = p.stock <= 0;

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-5xl mx-auto p-4 space-y-5 text-white">
                {/* Migas */}
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

                {/* Contenido */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Imagen */}
                    <div
                        className="relative rounded-[20px] overflow-hidden border border-white/10 bg-white/[0.03] aspect-square
                       "
                    >
                        {/* Glow sutil */}
                        <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(closest-side,rgba(124,58,237,0.25),transparent_70%)]" />
                        {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="relative z-10 w-full h-full object-contain p-4" />
                        ) : (
                            <div className="relative z-10 w-full h-full grid place-items-center text-white/50 text-sm">
                                Sin imagen
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div
                        className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5
                       space-y-3"
                    >
                        <h1
                            className="text-2xl font-extrabold leading-tight bg-clip-text text-transparent
                         bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                        >
                            {p.name}
                        </h1>

                        {p.sku && <div className="text-xs text-white/60">SKU: {p.sku}</div>}

                        <div className="mt-1 text-3xl font-bold tracking-wide">
                            <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Bs. {price.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-white/15 bg-white/5">
                                {p.condition === 'new' ? 'Nuevo' : p.condition === 'used' ? 'Usado' : 'Reacondicionado'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-white/15 bg-white/5">
                                Stock: <b className="ml-1">{p.stock}</b>
                            </span>
                            {p.is_unique && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px]
                                 border border-[#06B6D4] text-[#06B6D4]/95">
                                    Pieza única
                                </span>
                            )}
                        </div>

                        <p className="pt-1 text-white/85 whitespace-pre-line">{p.description ?? '—'}</p>

                        {/* Comprar */}
                        <div className="pt-1 flex items-center gap-3">
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
                                onClick={() => add(p, qty)}
                                className="px-5 py-2.5 rounded-xl font-medium text-white
                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 active:scale-[0.99] transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                            </button>
                        </div>

                        {/* Acciones secundarias */}
                        <div className="pt-2">
                            <Link
                                to="/"
                                className="px-5 py-2.5 rounded-xl font-medium text-white
                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 active:scale-[0.99] transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
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
