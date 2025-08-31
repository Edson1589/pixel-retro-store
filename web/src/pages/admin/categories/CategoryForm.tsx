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
        try { await onSubmit({ name: form.name.trim(), slug: form.slug.trim() || slugify(form.name) }); }
        finally { setBusy(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-3xl">
            <input
                className="border rounded-xl px-3 py-2"
                placeholder="Nombre (ej: Consolas)"
                value={form.name}
                onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
            />
            <input
                className="border rounded-xl px-3 py-2"
                placeholder="Slug (ej: consolas)"
                value={form.slug}
                onChange={e => setForm(s => ({ ...s, slug: e.target.value }))}
                onBlur={() => !form.slug && setForm(s => ({ ...s, slug: slugify(s.name) }))}
            />
            <button disabled={busy} className="px-4 py-2 rounded-xl bg-black text-white">
                {busy ? 'Guardando...' : submitLabel}
            </button>
        </form>
    );
}
