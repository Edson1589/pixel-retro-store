import { useEffect, useState } from 'react';
import { deleteCategory, getCategory } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Category } from '../../../types';

function getSlug(obj: unknown): string | undefined {
    if (typeof obj === 'object' && obj !== null && 'slug' in obj) {
        const v = (obj as Record<string, unknown>).slug;
        return typeof v === 'string' ? v : undefined;
    }
    return undefined;
}

export default function AdminCategoryDelete() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [c, setC] = useState<Category | null>(null);
    const [busy, setBusy] = useState(false);

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

    const doDelete = async () => {
        const cid = Number(id);
        if (!id || Number.isNaN(cid)) return;

        try {
            setBusy(true);
            await deleteCategory(cid);
            nav('/admin/categories');
        } finally {
            setBusy(false);
        }
    };

    if (!c) return <p className="text-white/70">Cargando…</p>;

    const slug = getSlug(c);

    return (
        <div className="text-white space-y-5 max-w-2xl mx-auto px-4">
            <h2
                className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                   bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
            >
                Eliminar categoría
            </h2>

            <div
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <div className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">{c.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {slug ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                                 border border-white/15 bg-white/10 text-white/80">
                                    slug: {slug}
                                </span>
                            ) : (
                                <span className="text-xs text-white/60">Sin slug</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
                    <div className="text-sm">
                        ¿Seguro que deseas eliminar <b>{c.name}</b> (#{String(c.id)})?{' '}
                        <span className="text-rose-200 font-medium">
                            Los productos quedarán sin categoría. Esta acción no se puede deshacer.
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        disabled={busy}
                        onClick={doDelete}
                        className="px-4 py-2 rounded-xl text-white
                       bg-rose-600 hover:bg-rose-500 disabled:opacity-60
                       shadow-[0_12px_30px_-12px_rgba(225,29,72,0.6)]"
                    >
                        {busy ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                    <Link
                        to={`/admin/categories/${c.id}`}
                        className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Cancelar
                    </Link>
                </div>
            </div>
        </div>
    );
}
