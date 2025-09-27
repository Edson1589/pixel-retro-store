import { useEffect, useMemo, useState } from 'react';
import { listCategories } from '../../../services/adminApi';
import type { Category, Product } from '../../../types';

type Props = {
    initial?: Product;
    onSubmit: (form: FormData) => Promise<void>;
    submitLabel?: string;
};

type FormState = {
    category_id: string | '';
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: string;
    stock: string;
    condition: Product['condition'];
    is_unique: boolean;
    status: Product['status'];
    image: File | null;
};

type ListResponse<T> = { data: T[] };

export default function ProductForm({ initial, onSubmit, submitLabel = 'Guardar' }: Props) {
    const [cats, setCats] = useState<Category[]>([]);
    const [busy, setBusy] = useState(false);

    const makeInitialForm = (i?: Product): FormState => ({
        category_id: i?.category_id != null ? String(i.category_id) : '',
        name: i?.name ?? '',
        slug: i?.slug ?? '',
        sku: i?.sku ?? '',
        description: i?.description ?? '',
        price: i?.price != null ? String(i.price) : '',
        stock: i?.stock != null ? String(i.stock) : '',
        condition: i?.condition ?? 'new',
        is_unique: Boolean(i?.is_unique),
        status: i?.status ?? 'active',
        image: null,
    });

    const [form, setForm] = useState<FormState>(() => makeInitialForm(initial));

    useEffect(() => {
        setForm(makeInitialForm(initial));
    }, [initial]);

    useEffect(() => {
        (async () => {
            const c = (await listCategories()) as ListResponse<Category>;
            setCats(c.data);
        })();
    }, []);

    const previewUrl = useMemo(() => {
        if (form.image) return URL.createObjectURL(form.image);
        return initial?.image_url ?? '';
    }, [form.image, initial?.image_url]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            const fd = new FormData();
            (['category_id', 'name', 'slug', 'sku', 'description', 'price', 'stock', 'condition', 'status'] as const)
                .forEach((k) => {
                    const v = form[k];
                    if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
                });

            fd.append('is_unique', form.is_unique ? '1' : '0');
            if (form.image) fd.append('image', form.image);

            await onSubmit(fd);
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select
                    className="border rounded-xl px-3 py-2"
                    value={form.category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                >
                    <option value="">(Sin categoría)</option>
                    {cats.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />

                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="slug-producto"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                />

                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="SKU"
                    value={form.sku}
                    onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                />

                <textarea
                    className="border rounded-xl px-3 py-2 md:col-span-4"
                    rows={3}
                    placeholder="Descripción"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />

                <input
                    className="border rounded-xl px-3 py-2"
                    type="number"
                    placeholder="Precio"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />

                <input
                    className="border rounded-xl px-3 py-2"
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                />

                <select
                    className="border rounded-xl px-3 py-2"
                    value={form.condition}
                    onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value as Product['condition'] }))}
                >
                    <option value="new">Nuevo</option>
                    <option value="used">Usado</option>
                    <option value="refurbished">Reacondicionado</option>
                </select>

                <select
                    className="border rounded-xl px-3 py-2"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Product['status'] }))}
                >
                    <option value="active">Activo</option>
                    <option value="draft">Borrador</option>
                </select>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.is_unique}
                        onChange={(e) => setForm((prev) => ({ ...prev, is_unique: e.target.checked }))}
                    />
                    <span>Pieza única</span>
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] ?? null }))}
                    className="border rounded-xl px-3 py-2"
                />
            </div>

            {previewUrl && (
                <div className="mt-2">
                    <div className="text-sm text-gray-500 mb-1">Vista previa</div>
                    <img src={previewUrl} alt={form.name || 'Vista previa'} className="max-h-40 rounded-xl border" />
                </div>
            )}

            <div className="mt-3">
                <button disabled={busy} className="px-4 py-2 rounded-xl bg-black text-white">
                    {busy ? 'Guardando...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
