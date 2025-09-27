import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories } from '../services/api';
import type { Category } from '../types';

export default function CategorySidebar() {
    const [cats, setCats] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sp, setSp] = useSearchParams();

    const active = sp.get('category') ?? '';

    useEffect(() => {
        (async () => {
            setLoading(true);
            try { setCats(await fetchCategories()); }
            finally { setLoading(false); }
        })();
    }, []);

    const select = (slug?: string) => {
        const next = new URLSearchParams(sp);
        if (!slug) next.delete('category');
        else next.set('category', slug);
        next.delete('page');
        setSp(next, { replace: true });
        setOpen(false);
    };

    return (
        <>
            <div className="md:hidden mb-3">
                <button
                    className="px-3 py-2 rounded-xl border w-full text-left"
                    onClick={() => setOpen(o => !o)}
                >
                    ☰ Categorías {open ? '▲' : '▼'}
                </button>
            </div>

            <aside
                className={`
          md:block md:w-64 md:shrink-0
          ${open ? 'block' : 'hidden'}
        `}
            >
                <div className="rounded-2xl border overflow-hidden">
                    <div className="bg-black text-white px-4 py-3 font-semibold uppercase text-sm tracking-wide">
                        Todas las categorías
                    </div>

                    <nav className="p-2">
                        <button
                            onClick={() => select(undefined)}
                            className={`block w-full text-left px-3 py-2 rounded-lg
                ${active === '' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'}
              `}
                        >
                            Todas
                        </button>

                        {loading ? (
                            <div className="px-3 py-2 text-sm text-gray-500">Cargando…</div>
                        ) : (
                            cats.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => select(c.slug)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg
                    ${active === c.slug ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'}
                  `}
                                >
                                    {c.name}
                                </button>
                            ))
                        )}
                    </nav>
                </div>
            </aside>
        </>
    );
}
