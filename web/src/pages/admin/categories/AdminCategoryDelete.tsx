import { useEffect, useState } from 'react';
import { deleteCategory, getCategory } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Category } from '../../../types';
import { FolderTree, Trash2, AlertTriangle, ArrowLeft, Link2 } from 'lucide-react';

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
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#f97373_0%,#fb7185_40%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(248,113,113,0.75)]
                       flex items-center justify-center"
                        >
                            <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                           bg-[linear-gradient(90deg,#fb7185_0%,#f97316_40%,#facc15_100%)]">
                                Eliminar categoría
                            </h2>
                            <p className="text-xs text-white/60">
                                Esta acción no se puede deshacer. Revisa bien antes de confirmar.
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/admin/categories/${c.id}`}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 grid place-items-center">
                            <FolderTree className="h-5 w-5 text-rose-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="text-sm font-semibold text-white/90">
                                {c.name}
                            </div>
                            {slug ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px]
                              border border-white/15 bg-white/10 text-white/80">
                                    <Link2 className="h-3 w-3" />
                                    <span className="font-mono">{slug}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-white/60">Sin slug</span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-3 text-sm">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-100 mt-0.5" />
                            <p>
                                ¿Seguro que deseas eliminar{' '}
                                <b>{c.name}. </b>
                                <span className="text-rose-100 font-medium">
                                    Los productos quedarán sin categoría. Esta acción no se puede deshacer.
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            disabled={busy}
                            onClick={doDelete}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                       border border-rose-400/60 bg-rose-500/20 hover:bg-rose-500/30 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{busy ? 'Eliminando…' : 'Sí, eliminar'}</span>
                        </button>

                        <Link
                            to={`/admin/categories/${c.id}`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                       border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancelar</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
