import type { Product } from '../types';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

type MaybeExtra = Partial<{
    rating: number;
    reviews_count: number;
    slug: string;
}>;

export default function ProductCard({ p }: { p: Product }) {
    const { add } = useCart();

    const price =
        typeof p.price === 'number'
            ? p.price
            : Number.parseFloat((p.price as unknown as string) ?? '0');

    const extra = p as Product & MaybeExtra;
    const slug = typeof extra.slug === 'string' ? extra.slug : undefined;

    const inStock = (p.stock ?? 0) > 0;

    return (
        <div
            className="
        rounded-2xl overflow-hidden
        bg-white/[0.04] border border-white/10 text-white
        shadow-[0_20px_40px_-24px_rgba(124,58,237,0.35)]
        flex flex-col
      "
        >
            <div className="relative h-44 bg-white/[0.06] overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                    <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                    />
                ) : (
                    <span className="text-xs text-white/50">Sin imagen</span>
                )}
            </div>


            {/* Contenido */}
            <div className="p-4 space-y-1.5">
                <h3 className="text-[13px] font-semibold leading-tight text-white/90">
                    {p.name}
                </h3>
                <p className="text-[12px] text-white/55">
                    {p.category?.name ?? '—'}
                </p>

                <p className="mt-1.5 text-[13px] font-bold text-[#06B6D4]">
                    Bs. {price.toFixed(2)}
                </p>

                <p className={`text-[12px] ${inStock ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {inStock ? 'En stock' : 'Agotado'} : {p.stock}
                </p>

                {/* Botones */}
                <div className="pt-2 flex items-center gap-2">
                    {slug ? (
                        <Link
                            to={`/products/${slug}`}
                            className="px-3 py-1.5 rounded-xl text-[12px]
                         bg-white/10 hover:bg-white/15 transition"
                        >
                            Ver
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl text-[12px]
                         bg-white/10 hover:bg-white/15 transition"
                        >
                            Ver
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={!inStock}
                        onClick={() => add(p, 1)}
                        className="px-3 py-1.5 rounded-xl text-[12px] font-medium
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110
                       disabled:opacity-40 disabled:cursor-not-allowed
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)] transition"
                    >
                        {inStock ? 'Agregar' : 'Sin stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}
