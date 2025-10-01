import { useEffect, useMemo, useState } from 'react';
import { adminListCategories } from '../../../services/adminApi';
import type { Category, Product } from '../../../types';
import FancySelect, { type Option } from "../../../components/FancySelect";

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

    useEffect(() => { setForm(makeInitialForm(initial)); }, [initial]);

    useEffect(() => {
        (async () => {
            const c = (await adminListCategories()) as ListResponse<Category>;
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
            ([
                'category_id',
                'name',
                'slug',
                'sku',
                'description',
                'price',
                'stock',
                'condition',
                'status',
            ] as const).forEach((k) => {
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

    type Condition = Product["condition"];
    type Status = Product["status"];

    const CONDITION_VALUES = ["new", "used", "refurbished"] as const;
    const STATUS_VALUES = ["active", "draft"] as const;

    const catOptions: Option[] = useMemo(() => ([
        { label: '(Sin categoría)', value: '' },           // opción vacía
        ...cats.map(c => ({ label: c.name, value: String(c.id) }))
    ]), [cats]);

    function isCondition(v: string): v is Condition {
        return (CONDITION_VALUES as readonly string[]).includes(v);
    }
    function isStatus(v: string): v is Status {
        return (STATUS_VALUES as readonly string[]).includes(v);
    }

    const conditionOptions: Option[] = [
        { label: "Nuevo", value: "new" },
        { label: "Usado", value: "used" },
        { label: "Reacondicionado", value: "refurbished" },
    ];

    const statusOptions: Option[] = [
        { label: "Activo", value: "active" },
        { label: "Borrador", value: "draft" },
    ];
    return (
        <div className="space-y-5 text-white">
            {/* Título */}
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                Formulario Producto
            </h2>

            {/* Card */}
            <form onSubmit={handleSubmit}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6
                       shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] space-y-7">

                {/* Grupo: Datos Generales */}
                <div>
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Datos Generales
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <label className="col-span-1">
                            <span className="sr-only">Categoría</span>
                            <FancySelect
                                className="w-full"
                                value={form.category_id ?? ''}                      // siempre string
                                onChange={(v) => setForm(prev => ({ ...prev, category_id: v }))}
                                options={catOptions}
                                placeholder="Seleccionar categoría"
                            />
                        </label>

                        <label className="col-span-1">
                            <span className="sr-only">Nombre</span>
                            <input
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="Nombre"
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </label>

                        <label className="col-span-1">
                            <span className="sr-only">Slug</span>
                            <input
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="slug-producto"
                                value={form.slug}
                                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                            />
                        </label>

                        <label className="col-span-1">
                            <span className="sr-only">SKU</span>
                            <input
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="SKU"
                                value={form.sku}
                                onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                            />
                        </label>

                        <label className="md:col-span-4">
                            <span className="sr-only">Descripción</span>
                            <textarea
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                rows={3}
                                placeholder="Descripción"
                                value={form.description}
                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            />
                        </label>
                    </div>
                </div>

                {/* Grupo: Inventario */}
                <div>
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Inventario
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <label>
                            <span className="sr-only">Precio</span>
                            <input
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                type="number"
                                placeholder="Precio"
                                value={form.price}
                                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                            />
                        </label>

                        <label>
                            <span className="sr-only">Stock</span>
                            <input
                                className="w-full rounded-xl px-3 py-2
                           bg-white/[0.05] text-white/90 placeholder:text-white/45
                           border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                type="number"
                                placeholder="Stock"
                                value={form.stock}
                                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                            />
                        </label>

                        <label>
                            <span className="sr-only">Condición</span>
                            <FancySelect
                                className="min-w-[160px]"
                                value={form.condition}
                                placeholder="Condición"
                                options={conditionOptions}
                                onChange={(v) => {
                                    if (isCondition(v)) {
                                        setForm((prev) => ({ ...prev, condition: v }));
                                    }
                                }}
                            />
                        </label>

                        <label>
                            <span className="sr-only">Estado</span>
                            <FancySelect
                                className="min-w-[140px]"
                                value={form.status}
                                placeholder="Estado"
                                options={statusOptions}
                                onChange={(v) => {
                                    if (isStatus(v)) {
                                        setForm((prev) => ({ ...prev, status: v }));
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                {/* Grupo: Opciones */}
                <div>
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Opciones
                    </div>

                    <label className="inline-flex items-center gap-2 select-none">
                        <input
                            type="checkbox"
                            checked={form.is_unique}
                            onChange={(e) => setForm((prev) => ({ ...prev, is_unique: e.target.checked }))}
                            className="h-4 w-4 rounded border-white/20 bg-white/10
                         checked:bg-[#06B6D4] checked:hover:bg-[#06B6D4]
                         focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        />
                        <span className="text-white/90">Pieza única</span>
                    </label>
                </div>

                {/* Grupo: Imagen */}
                <div>
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Imagen
                    </div>

                    <label className="block">
                        <span className="sr-only">Subir imagen</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] ?? null }))}
                            className="w-full rounded-xl px-3 py-2
                         file:mr-3 file:px-3 file:py-1.5 file:rounded-lg
                         file:border-0 file:bg-[#7C3AED] file:text-white
                         bg-white/[0.05] text-white/90 border border-white/10"
                        />
                    </label>

                    {/* Vista previa en card */}
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/60 mb-2">Vista previa</div>
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt={form.name || 'Vista previa'}
                                className="max-h-48 rounded-xl border border-white/10 object-contain"
                            />
                        ) : (
                            <div className="h-32 grid place-items-center rounded-xl
                              bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/20
                              border border-white/10 text-white/60 text-sm">
                                Sin imagen
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                    <button
                        disabled={busy}
                        className="px-4 py-2 rounded-xl text-white font-medium
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110
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
            </form>
        </div>
    );
}
