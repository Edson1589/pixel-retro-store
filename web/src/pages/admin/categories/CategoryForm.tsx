import { useState } from 'react';
import { FolderTree, Link2, ArrowLeft } from 'lucide-react';

type Props = {
    initial?: { name: string; slug: string } | null;
    onSubmit: (payload: { name: string; slug: string }) => Promise<void>;
    submitLabel?: string;
};

function slugify(s: string) {
    return s
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function CategoryForm({ initial, onSubmit, submitLabel = 'Guardar' }: Props) {
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        slug: initial?.slug ?? '',
    });
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            await onSubmit({
                name: form.name.trim(),
                slug: (form.slug.trim() || slugify(form.name)).trim(),
            });
        } finally {
            setBusy(false);
        }
    };

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
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Formulario de categoría
                            </h2>
                            <p className="text-xs text-white/60">
                                Crea o edita una categoría para organizar tu catálogo de productos.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>

                {/* FORMULARIO */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-1 rounded-2xl border border-white/10 p-4 bg-white/[0.04]
                   w-full grid gap-3"
                >
                    {/* Nombre */}
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <FolderTree className="h-3 w-3" />
                            <span>Nombre</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FolderTree className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                required
                                className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                         pl-9 pr-3 text-sm outline-none
                         text-white/90 placeholder:text-white/45
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                placeholder="Ej. Consolas retro"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, name: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            <span>Slug</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Link2 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                required
                                className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                         pl-9 pr-3 text-sm outline-none
                         text-white/90 placeholder:text-white/45
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                placeholder="Ej. consolas"
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, slug: e.target.value }))
                                }
                                onBlur={() =>
                                    !form.slug &&
                                    setForm((s) => ({ ...s, slug: slugify(s.name) }))
                                }
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="pt-1 flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={busy}
                            className="h-11 px-4 rounded-xl
                       bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                       text-sm font-medium
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       hover:brightness-110
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {busy ? 'Guardando…' : submitLabel}
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="h-11 px-4 rounded-xl
                       border border-white/10 bg-white/[0.06] hover:bg-white/10
                       text-sm text-white/85"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
