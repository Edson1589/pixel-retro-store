import { useEffect, useMemo, useState } from 'react';
import { adminListCategories } from '../../../services/adminApi';
import type { Category, Product } from '../../../types';
import FancySelect, { type Option } from "../../../components/FancySelect";
import {
    ArrowLeft,
    PackagePlus,
    Tag,
    Type,
    Hash,
    Barcode,
    FileText,
    DollarSign,
    Boxes,
    BadgeCheck,
    Activity,
    ImageUp,
    Save,
} from 'lucide-react';

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
    const [imgError, setImgError] = useState<string | null>(null);


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
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                        >
                            <PackagePlus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Formulario Producto
                            </h2>
                            <p className="text-xs text-white/60">
                                Define datos generales, inventario e imagen del producto.
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

                <form
                    onSubmit={handleSubmit}
                    className="mt-1 rounded-2xl border border-white/10 p-4 bg-white/[0.04]
                   w-full space-y-6"
                >
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-cyan-300" />
                            <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-white/55">
                                    Datos generales
                                </div>
                                <p className="text-[11px] text-white/50">
                                    Nombre, categoría, identificadores y descripción corta.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    <span>Categoría</span>
                                </label>
                                <FancySelect
                                    className="w-full"
                                    value={form.category_id ?? ''}
                                    onChange={(v) =>
                                        setForm((prev) => ({ ...prev, category_id: v }))
                                    }
                                    options={catOptions}
                                    placeholder="Seleccionar categoría…"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <PackagePlus className="h-3 w-3" />
                                    <span>Nombre</span>
                                    <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <Type className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                             pl-9 pr-3 text-sm outline-none
                             text-white/90 placeholder:text-white/45
                             focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                        placeholder="Ej: Super Nintendo Classic"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    <span>Slug</span>
                                    <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <Hash className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                             pl-9 pr-3 text-sm outline-none
                             text-white/90 placeholder:text-white/45
                             focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                        placeholder="ej: super-nintendo-classic"
                                        value={form.slug}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, slug: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Barcode className="h-3 w-3" />
                                    <span>SKU</span>
                                </label>
                                <div className="relative">
                                    <Barcode className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                             pl-9 pr-3 text-sm outline-none
                             text-white/90 placeholder:text-white/45
                             focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                        placeholder="Código interno / SKU"
                                        value={form.sku}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, sku: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>Descripción</span>
                                <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <FileText className="h-4 w-4 text-white/50 absolute left-3 top-3 pointer-events-none" />
                                <textarea
                                    maxLength={255}
                                    required
                                    className="w-full rounded-xl bg-white/10 border border-white/10
                           pl-9 pr-3 py-2 text-sm outline-none
                           text-white/90 placeholder:text-white/45
                           focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]
                           min-h-[88px]"
                                    placeholder="Descripción breve para mostrar en el catálogo…"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                                <div className="mt-1 text-[11px] text-white/50 text-right">
                                    {form.description?.length ?? 0}/255
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-emerald-300" />
                            <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-white/55">
                                    Inventario
                                </div>
                                <p className="text-[11px] text-white/50">
                                    Controla el precio, stock, condición y estado de publicación.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>Precio (Bs.)</span>
                                    <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        type="number"
                                        min={0}
                                        max={9999}
                                        step={0.01}
                                        className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                             pl-9 pr-3 text-sm outline-none
                             text-white/90 placeholder:text-white/45
                             focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                        placeholder="0.00"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, price: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Boxes className="h-3 w-3" />
                                    <span>Stock</span>
                                    <span className="text-rose-400">*</span>
                                </label>
                                <div className="relative">
                                    <Boxes className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        type="number"
                                        min={0}
                                        max={1000}
                                        step={1}
                                        className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                             pl-9 pr-3 text-sm outline-none
                             text-white/90 placeholder:text-white/45
                             focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                        placeholder="0"
                                        value={form.stock}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, stock: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <BadgeCheck className="h-3 w-3" />
                                    <span>Condición</span>
                                </label>
                                <FancySelect
                                    className="w-full"
                                    value={form.condition}
                                    placeholder="Seleccionar condición…"
                                    options={conditionOptions}
                                    onChange={(v) => {
                                        if (isCondition(v)) {
                                            setForm((prev) => ({ ...prev, condition: v }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    <span>Estado</span>
                                </label>
                                <FancySelect
                                    className="w-full"
                                    value={form.status}
                                    placeholder="Seleccionar estado…"
                                    options={statusOptions}
                                    onChange={(v) => {
                                        if (isStatus(v)) {
                                            setForm((prev) => ({ ...prev, status: v }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ImageUp className="h-4 w-4 text-cyan-300" />
                            <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-white/55">
                                    Imagen
                                </div>
                                <p className="text-[11px] text-white/50">
                                    JPG o PNG hasta 4MB. Se mostrará en la ficha del producto.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block">
                                <span className="sr-only">Subir imagen</span>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setImgError(null);

                                        if (!file) {
                                            setForm((prev) => ({ ...prev, image: null }));
                                            return;
                                        }

                                        const allowedTypes = ['image/png', 'image/jpeg'];
                                        const byType = allowedTypes.includes(file.type);
                                        const byName = /\.(png|jpe?g)$/i.test(file.name);

                                        if (!(byType || byName)) {
                                            setImgError('Solo se permiten imágenes PNG o JPG.');
                                            e.target.value = '';
                                            setForm((prev) => ({ ...prev, image: null }));
                                            return;
                                        }

                                        if (file.size > 4 * 1024 * 1024) {
                                            setImgError('El archivo no debe superar los 4MB.');
                                            e.target.value = '';
                                            setForm((prev) => ({ ...prev, image: null }));
                                            return;
                                        }

                                        setForm((prev) => ({ ...prev, image: file }));
                                    }}
                                    className="w-full rounded-xl px-3 py-2
                           file:mr-3 file:px-3 file:py-1.5 file:rounded-lg
                           file:border-0 file:bg-[#7C3AED] file:text-white file:text-sm
                           bg-white/[0.05] text-white/90 border border-white/10
                           text-sm"
                                />
                                {imgError && (
                                    <p className="mt-1 text-xs text-rose-400">{imgError}</p>
                                )}
                            </label>

                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="text-xs text-white/60 mb-2">Vista previa</div>
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt={form.name || 'Vista previa'}
                                        className="max-h-48 rounded-xl border border-white/10 object-contain mx-auto"
                                    />
                                ) : (
                                    <div className="h-32 grid place-items-center rounded-xl
                                bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.4),_transparent_60%),rgba(15,23,42,0.9)]
                                border border-white/10 text-white/60 text-sm">
                                        Sin imagen seleccionada
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="pt-1 flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                       text-sm font-medium
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       hover:brightness-110
                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4" />
                            <span>{busy ? 'Guardando…' : submitLabel}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl
                       border border-white/15 bg-white/[0.06] text-white/80
                       text-sm hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancelar</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
