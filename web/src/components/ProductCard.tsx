import type { Product } from '../types';
import { Link } from 'react-router-dom';
import { useCallback } from 'react';
import { trackProductClick, signalInteract, prefer } from '../services/telemetry';

type MaybeExtra = Partial<{
  rating: number;
  reviews_count: number;
  slug: string;
}>;

export default function ProductCard({ p, currentQuery }: { p: Product; currentQuery?: string }) {
  const price =
    typeof p.price === 'number'
      ? p.price
      : Number.parseFloat((p.price as unknown as string) ?? '0');

  const extra = p as Product & MaybeExtra;
  const slug = typeof extra.slug === 'string' ? extra.slug : undefined;
  const inStock = (p.stock ?? 0) > 0;

  const handleView = useCallback(() => {
    prefer(p.id);
    void signalInteract(p.id, 'view');
    if (currentQuery?.trim()) {
      trackProductClick(p.id, currentQuery, 'products_grid');
    }
  }, [p.id, currentQuery]);

  const CardInner = (
    <>
      <div className="relative h-44 sm:h-48 md:h-52 bg-white/[0.06] overflow-hidden flex items-center justify-center">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-contain p-2 transition-transform duration-150 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-white/50">Sin imagen</span>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-1.5">
        <h3 className="text-[13px] sm:text-[14px] font-semibold leading-tight text-white/90 line-clamp-2">
          {p.name}
        </h3>
        <p className="text-[12px] sm:text-[13px] text-white/55">{p.category?.name ?? '—'}</p>

        <p className="mt-1.5 text-[13px] sm:text-[14px] font-bold text-[#06B6D4]">
          Bs. {price.toFixed(2)}
        </p>

        <p
          className={`text-[12px] sm:text-[13px] ${
            inStock ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {inStock ? 'En stock' : 'Agotado'} : {p.stock}
        </p>
      </div>
    </>
  );

  const baseCardStyle = `
    group block rounded-2xl overflow-hidden
    bg-white/[0.04] border border-white/10 text-white
    shadow-[0_20px_40px_-24px_rgba(124,58,237,0.35)]
    hover:bg-white/[0.06] transition
    focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
    w-full sm:w-auto
  `;

  if (slug) {
    return (
      <Link
        to={`/products/${slug}`}
        onClick={handleView}
        onAuxClick={handleView}
        className={baseCardStyle}
        aria-label={`Ver detalles de ${p.name}`}
      >
        {CardInner}
      </Link>
    );
  }

  return (
    <div
      className={`${baseCardStyle} flex flex-col`}
    >
      {CardInner}
    </div>
  );
}
