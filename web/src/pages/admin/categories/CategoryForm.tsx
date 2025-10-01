import { useState } from 'react';

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
        <div className="space-y-5 text-white">
            {/* Título */}
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                Formulario Categoría
            </h2>

            {/* Card */}
            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6
                   shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="md:col-span-1">
                        <span className="sr-only">Nombre</span>
                        <input
                            className="w-full rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none
                         focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Nombre (ej: Consolas)"
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        />
                    </label>

                    <label className="md:col-span-1">
                        <span className="sr-only">Slug</span>
                        <input
                            className="w-full rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none
                         focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Slug (ej: consolas)"
                            value={form.slug}
                            onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
                            onBlur={() => !form.slug && setForm((s) => ({ ...s, slug: slugify(s.name) }))}
                        />
                    </label>

                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        disabled={busy}
                        className="w-full md:w-auto px-4 py-2 rounded-xl text-white font-medium
                         bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition
                         shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                         disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {busy ? 'Guardando...' : submitLabel}
                    </button>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-4 py-2 rounded-xl border border-white/15 text-white/80
                       hover:bg-white/5"
                    >
                        Cancelar
                    </button>

                </div>

                <p className="mt-3 text-xs text-white/60">
                    Si dejas el <em>slug</em> vacío, se generará automáticamente a partir del nombre.
                </p>
            </form>
        </div>
    );
}
