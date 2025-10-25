import { useEffect, useState } from 'react';
import { getCategory } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import type { Category } from '../../../types';

type CategoryView = Category & { products_count?: number };

export default function AdminCategoryShow() {
    const { id } = useParams<{ id: string }>();
    const [c, setC] = useState<CategoryView | null>(null);

    useEffect(() => {
        const cid = Number(id);
        if (!id || Number.isNaN(cid)) return;

        let cancelled = false;
        (async () => {
            const cat = await getCategory(cid);
            if (!cancelled) setC(cat);
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!c) return <p className="text-white/70">Cargando…</p>;

    return (
        <div className="text-white space-y-5 max-w-2xl mx-auto px-4">
            <div className="flex items-center gap-3">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                >
                    Categoría · #{c.id}
                </h2>

                <div className="ml-auto flex gap-2">
                    <Link
                        to={`/admin/categories/${c.id}/edit`}
                        className="px-3 py-2 rounded-xl text-sm text-white bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                       hover:brightness-110 shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]"
                    >
                        Editar
                    </Link>
                    <Link
                        to={`/admin/categories/${c.id}/delete`}
                        className="px-3 py-2 rounded-xl text-sm border border-rose-400/30 text-rose-200 bg-rose-500/10 hover:bg-rose-500/15"
                    >
                        Eliminar
                    </Link>
                    <Link
                        to="/admin/categories"
                        className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            <div
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">{c.name}</div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                           border border-white/15 bg-white/10 text-white/80">
                        slug: {c.slug}
                    </span>
                </div>

                {'products_count' in c && c.products_count !== undefined && (
                    <div className="grid sm:grid-cols-1 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs text-white/60">Productos asociados</div>
                            <div className="mt-1 text-2xl font-bold text-[#06B6D4]">{c.products_count}</div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
