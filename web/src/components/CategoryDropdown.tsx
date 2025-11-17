import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCategories } from '../services/api';
import type { Category } from '../types';
import {
    Gamepad2,
    Monitor,
    Headphones,
    Tag,
    Sparkles,
    Boxes,
    ListTree,
} from 'lucide-react';

function CatIcon({ name }: { name?: string }) {
    const key = (name ?? '').toLowerCase();
    const common = 'h-4 w-4';

    if (key.includes('consol')) return <Monitor className={common} aria-hidden />;
    if (key.includes('juego')) return <Gamepad2 className={common} aria-hidden />;
    if (key.includes('acces')) return <Headphones className={common} aria-hidden />;
    if (key.includes('oferta') || key.includes('promo'))
        return <Tag className={common} aria-hidden />;
    return <Sparkles className={common} aria-hidden />;
}

type Props = {
    onClose?: () => void;
};

export default function CategoryDropdown({ onClose }: Props) {
    const [cats, setCats] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const loc = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(loc.search);
    const active = params.get('category') ?? '';
    const search = params.get('search') ?? '';
    const condition = params.get('condition') ?? '';
    const getCount = (c: Category) => c.products_count ?? 0;

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                setCats(await fetchCategories());
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const select = (slug?: string) => {
        const next = new URLSearchParams();

        if (slug) next.set('category', slug);
        if (search) next.set('search', search);
        if (condition) next.set('condition', condition);

        navigate(
            {
                pathname: '/',
                search: next.toString(),
            },
            {
                state: { fromCategoryMenu: true },
            }
        );

        onClose?.();
    };




    return (
        <div className="absolute left-0 mt-2 w-[min(100vw-2rem,280px)] z-50">
            <div
                className="
          overflow-hidden rounded-2xl
          bg-[linear-gradient(180deg,#121A2A_0%,#0B1423_100%)]
          border border-white/10 text-white/90
          shadow-[0_18px_50px_-22px_rgba(15,23,42,1)]
        "
            >
                <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/55 border-b border-white/5">
                    <ListTree className="h-4 w-4" />
                    <span>Categorías</span>
                </div>

                <nav className="max-h-[70vh] overflow-y-auto p-2 text-sm">
                    {/* Todas */}
                    <button
                        onClick={() => select(undefined)}
                        className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl
              ${active === ''
                                ? 'bg-white/10 text-white'
                                : 'text-white/80 hover:bg-white/5'
                            }`}
                    >
                        <span className="text-white/80">
                            <Boxes className="h-4 w-4" />
                        </span>
                        <span className="truncate">Todas</span>

                        {active === '' && (
                            <span
                                className="pointer-events-none absolute left-0 my-auto h-5 w-1.5 rounded-r-full
                  bg-[linear-gradient(180deg,#7C3AED_0%,#06B6D4_100%)]"
                            />
                        )}
                    </button>

                    {/* Lista de categorías */}
                    {loading ? (
                        <div className="px-3 py-2 text-white/60 text-sm">Cargando…</div>
                    ) : (
                        cats
                            .filter((c) => getCount(c) > 0)
                            .map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => select(c.slug)}
                                    className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl
                    ${active === c.slug
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/80 hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-white/80">
                                        <CatIcon name={c.name} />
                                    </span>
                                    <span className="truncate">{c.name}</span>

                                    <span className="ml-auto text-xs tabular-nums text-white/70">
                                        {getCount(c)}
                                    </span>

                                    {active === c.slug && (
                                        <span
                                            className="pointer-events-none absolute left-0 my-auto h-5 w-1.5 rounded-r-full
                        bg-[linear-gradient(180deg,#7C3AED_0%,#06B6D4_100%)]"
                                        />
                                    )}
                                </button>
                            ))
                    )}
                </nav>
            </div>
        </div>
    );
}
