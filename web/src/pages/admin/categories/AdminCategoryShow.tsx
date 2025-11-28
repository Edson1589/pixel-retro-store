import { useEffect, useState } from 'react';
import { getCategory } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import type { Category } from '../../../types';
import { FolderTree, Link2, Boxes, ArrowLeft, Edit3, Trash2 } from 'lucide-react';

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
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                        >
                            <FolderTree className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                          bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Categoría · {c.name}
                            </h2>
                            <p className="text-xs text-white/60">
                                Detalle de la categoría y productos asociados.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to={`/admin/categories/${c.id}/edit`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15 text-sm"
                        >
                            <Edit3 className="h-4 w-4" />
                            <span>Editar</span>
                        </Link>
                        <Link
                            to={`/admin/categories/${c.id}/delete`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15 text-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                        </Link>
                    </div>

                    <Link
                        to="/admin/categories"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
                </div>

                {/* CARD DETALLE */}
                <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] space-y-4">
                    {/* Nombre + slug */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="h-11 w-11 rounded-xl bg-white/[0.08] border border-white/15 grid place-items-center">
                                <FolderTree className="h-5 w-5 text-cyan-300" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white/90">
                                    {c.name}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-white/60">
                                    <Link2 className="h-3 w-3" />
                                    <span className="font-mono text-white/70">{c.slug}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Métrica productos */}
                    {'products_count' in c && c.products_count !== undefined && (
                        <div className="grid sm:grid-cols-1 gap-3 text-sm">
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                                    <Boxes className="h-4 w-4 text-cyan-300" />
                                </div>
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                                        Productos asociados
                                    </div>
                                    <div className="text-xl font-semibold text-[#06B6D4]">
                                        {c.products_count}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
