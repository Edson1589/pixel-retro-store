import { useEffect, useMemo, useState } from 'react';
import FancySelect, { type Option } from "../../../components/FancySelect";

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

type FormState = {
    start_at: string;
    end_at: string;
    registration_open_at: string;
    registration_close_at: string;
};

type FieldKey = keyof FormState;
type Errors = Partial<Record<FieldKey, string>>;

const toMs = (s: string) => {
    if (!s) return NaN;
    const d = new Date(s);
    const t = d.getTime();
    return Number.isNaN(t) ? NaN : t;
};

const toInputValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function validate(form: FormState): Errors {
    const e: Errors = {};
    const s = toMs(form.start_at);
    const f = toMs(form.end_at);
    const ro = toMs(form.registration_open_at);
    const rc = toMs(form.registration_close_at);
    const now = Date.now();

    if (!Number.isNaN(s) && s <= now) {
        e.start_at = 'La fecha inicio debe ser posterior a la fecha y hora actuales.';
    }

    if (!Number.isNaN(ro) && !Number.isNaN(s) && ro > s) {
        e.end_at = 'La fecha de apertura no puede ser posterior a la fecha de inicio'
    }
    if (!Number.isNaN(s) && !Number.isNaN(f) && s > f) {
        e.end_at = 'La fecha fin no puede ser anterior a la fecha inicio.';
    }

    if (!Number.isNaN(ro) && !Number.isNaN(rc) && ro > rc) {
        e.registration_close_at = 'El cierre de registro no puede ser anterior a la apertura.';
    }

    if (!Number.isNaN(rc) && !Number.isNaN(s) && rc > s) {
        e.registration_close_at = 'El cierre de registro no puede ser posterior a la fecha de inicio.';
    }

    if (!Number.isNaN(ro) && !Number.isNaN(s) && ro > s) {
        e.registration_open_at = 'La apertura de registro no puede ser posterior a la fecha de inicio.';
    }

    return e;
}


type Props = {
    initial?: EventInitial;
    onSubmit: (fd: FormData) => Promise<void>;
    submitLabel?: string;
};

type EventInitial = {
    title?: string | null;
    slug?: string | null;
    type?: EventKind | null;
    description?: string | null;
    location?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    capacity?: number | string | null;
    status?: EventStatus | null;
    registration_open_at?: string | null;
    registration_close_at?: string | null;
    banner_url?: string | null;
};

type EventFormState = {
    title: string;
    slug: string;
    type: EventKind;
    description: string;
    location: string;
    start_at: string;
    end_at: string;
    capacity: string;
    status: EventStatus;
    registration_open_at: string;
    registration_close_at: string;
    banner: File | null;
    banner_url: string;
};

export default function EventForm({ initial, onSubmit, submitLabel = 'Guardar' }: Props) {
    const [busy, setBusy] = useState(false);
    const [bannerError, setBannerError] = useState<string | null>(null);


    const [form, setForm] = useState<EventFormState>({
        title: initial?.title ?? '',
        slug: initial?.slug ?? '',
        type: (initial?.type ?? 'event') as EventKind,
        description: initial?.description ?? '',
        location: initial?.location ?? '',
        start_at: initial?.start_at ? initial.start_at.substring(0, 16) : '',
        end_at: initial?.end_at ? initial.end_at.substring(0, 16) : '',
        capacity: initial?.capacity != null ? String(initial.capacity) : '',
        status: (initial?.status ?? 'draft') as EventStatus,
        registration_open_at: initial?.registration_open_at ? initial.registration_open_at.substring(0, 16) : '',
        registration_close_at: initial?.registration_close_at ? initial.registration_close_at.substring(0, 16) : '',
        banner: null,
        banner_url: initial?.banner_url ?? '',
    });

    const [errors, setErrors] = useState<Errors>({});

    const inputCls =
        "w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]";

    const withError = (field: FieldKey) =>
        `${inputCls} ${errors[field] ? 'ring-2 ring-red-500 focus:ring-red-500' : ''}`;

    const nowInput = useMemo(() => toInputValue(new Date()), []);

    useEffect(() => {
        setErrors(validate(form));
    }, [form]);


    const preview = useMemo<string | null>(() => {
        if (form.banner) return URL.createObjectURL(form.banner);
        return form.banner_url || null;
    }, [form.banner, form.banner_url]);

    useEffect(() => {
        return () => {
            if (preview && form.banner) URL.revokeObjectURL(preview);
        };
    }, [preview, form.banner]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const v = validate(form);
        if (Object.keys(v).length) {
            setErrors(v);
            return;
        }
        setBusy(true);
        try {
            const fd = new FormData();
            ([
                'title',
                'slug',
                'type',
                'description',
                'location',
                'start_at',
                'end_at',
                'capacity',
                'status',
                'registration_open_at',
                'registration_close_at',
            ] as const).forEach((k) => {
                const v = form[k];
                if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
            });
            if (form.banner) fd.append('banner', form.banner);
            await onSubmit(fd);
        } finally {
            setBusy(false);
        }
    };

    const maxRegOpen: string | undefined = useMemo(() => {
        const { registration_close_at, start_at } = form;
        if (registration_close_at && start_at) {
            return toMs(registration_close_at) < toMs(start_at)
                ? registration_close_at
                : start_at;
        }
        return registration_close_at || start_at || undefined;
    }, [form]);

    type EventStatus = 'draft' | 'published' | 'archived';
    type EventKind = 'event' | 'tournament';

    const statusOptions: Option[] = [
        { label: 'Borrador', value: 'draft' },
        { label: 'Publicado', value: 'published' },
        { label: 'Archivado', value: 'archived' },
    ];

    const kindOptions: Option[] = [
        { label: 'Evento', value: 'event' },
        { label: 'Torneo', value: 'tournament' },
    ];


    return (
        <div className="space-y-5 text-white">
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                Formulario de Evento
            </h2>

            <form
                onSubmit={submit}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6
                   shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] space-y-8"
            >
                <section className="space-y-3">
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Datos principales
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Título <span className="text-red-500">*</span>
                            <span className="sr-only">Título</span>
                            <input required
                                className={inputCls}
                                placeholder="Título"
                                value={form.title}
                                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                            />
                        </label>

                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Slug <span className="text-red-500">*</span>
                            <span className="sr-only">Slug</span>
                            <input required
                                className={inputCls}
                                placeholder="slug-evento"
                                value={form.slug}
                                onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
                            />
                        </label>

                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Tipo
                            <FancySelect
                                className={"min-w-[160px]"}
                                value={form.type}
                                onChange={(v) => setForm(s => ({ ...s, type: v as EventKind }))}
                                options={kindOptions}
                            />

                        </label>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        Detalles
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                        <label className="space-y-1 md:col-span-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Lugar <span className="text-red-500">*</span>
                            <span className="sr-only">Lugar</span>
                            <input required
                                className={inputCls}
                                placeholder="Lugar"
                                value={form.location}
                                onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                            />
                        </label>

                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Fecha inicio <span className="text-red-500">*</span>
                            <span className="sr-only">Inicio</span>
                            <input
                                required
                                className={withError('start_at')}
                                type="datetime-local"
                                value={form.start_at}
                                min={nowInput}
                                max={form.end_at || undefined}
                                onChange={(e) => setForm((s) => ({ ...s, start_at: e.target.value }))}
                                aria-invalid={!!errors.start_at}
                                aria-describedby={errors.start_at ? 'err-start' : undefined}
                            />
                            {errors.start_at && <p id="err-start" className="text-red-500 text-xs">{errors.start_at}</p>}
                        </label>

                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Fecha Fin
                            <span className="sr-only">Fin</span>
                            <input
                                className={withError('end_at')}
                                type="datetime-local"
                                value={form.end_at}
                                min={form.start_at || nowInput}
                                onChange={(e) => setForm((s) => ({ ...s, end_at: e.target.value }))}
                                aria-invalid={!!errors.end_at}
                                aria-describedby={errors.end_at ? 'err-end' : undefined}
                            />
                            {errors.end_at && <p id="err-end" className="text-red-500 text-xs">{errors.end_at}</p>}
                        </label>

                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Capacidad
                            <span className="sr-only">Capacidad</span>
                            <input
                                className={inputCls}
                                type="number"
                                placeholder="Capacidad (opcional)"
                                value={form.capacity}
                                onChange={(e) => setForm((s) => ({ ...s, capacity: e.target.value }))}
                            />
                        </label>

                        <label className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Estado
                            <FancySelect
                                className={"min-w-[160px]"}
                                value={form.status}
                                onChange={(v) => setForm(s => ({ ...s, status: v as EventStatus }))}
                                options={statusOptions}
                            />
                        </label>



                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Apertura de registro
                            <span className="sr-only">Apertura de registro</span>
                            <input
                                className={withError('registration_open_at')}
                                type="datetime-local"
                                value={form.registration_open_at}
                                max={maxRegOpen}
                                onChange={(e) => setForm((s) => ({ ...s, registration_open_at: e.target.value }))}
                                aria-invalid={!!errors.registration_open_at}
                                aria-describedby={errors.registration_open_at ? 'err-ro' : undefined}
                            />
                            {errors.registration_open_at && (
                                <p id="err-ro" className="text-red-500 text-xs">{errors.registration_open_at}</p>
                            )}
                        </label>


                        <label className="space-y-1 mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Cierre de registro
                            <span className="sr-only">Cierre de registro</span>
                            <input
                                className={withError('registration_close_at')}
                                type="datetime-local"
                                value={form.registration_close_at}
                                min={form.registration_open_at || undefined}
                                max={form.start_at || undefined}
                                onChange={(e) => setForm((s) => ({ ...s, registration_close_at: e.target.value }))}
                                aria-invalid={!!errors.registration_close_at}
                                aria-describedby={errors.registration_close_at ? 'err-rc' : undefined}
                            />
                            {errors.registration_close_at && <p id="err-rc" className="text-red-500 text-xs">{errors.registration_close_at}</p>}
                        </label>

                    </div>
                </section>

                <section className="space-y-3">
                    <div className="mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                        descripción <span className="text-red-500">*</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        <label className="space-y-1 md:col-span-3">
                            <span className="sr-only">Descripción</span>
                            <textarea required
                                className={`${inputCls} md:h-28`}
                                placeholder="Detalles del evento, premios, dinámica…"
                                value={form.description}
                                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block mb-3 text-sm font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            Imagen
                            <span className="sr-only">Banner</span>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setBannerError(null);

                                    if (!file) {
                                        setForm((prev) => ({ ...prev, banner: null }));
                                        return;
                                    }

                                    const allowedTypes = ['image/png', 'image/jpeg'];
                                    const byType = allowedTypes.includes(file.type);
                                    const byName = /\.(png|jpe?g)$/i.test(file.name);

                                    if (!(byType || byName)) {
                                        setBannerError('Solo se permiten imágenes PNG o JPG.');
                                        e.target.value = '';
                                        setForm((prev) => ({ ...prev, banner: null }));
                                        return;
                                    }

                                    if (file.size > 4 * 1024 * 1024) {
                                        setBannerError('El archivo no debe superar los 4MB.');
                                        e.target.value = '';
                                        setForm((prev) => ({ ...prev, banner: null }));
                                        return;
                                    }

                                    setForm((prev) => ({ ...prev, banner: file }));
                                }}
                                className="w-full rounded-xl px-3 py-2
                                file:mr-3 file:px-3 file:py-1.5 file:rounded-lg
                                file:border-0 file:bg-[#7C3AED] file:text-white
                                bg-white/[0.05] text-white/90 border border-white/10"
                            />
                            {bannerError && (
                                <p className="mt-1 text-xs text-rose-400">{bannerError}</p>
                            )}
                        </label>


                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                                <div className="text-xs text-white/60 mb-2">Vista previa</div>
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview del banner"
                                        className="max-h-48 w-full object-cover rounded-xl border border-white/10"
                                    />
                                ) : (
                                    <div className="h-32 grid place-items-center rounded-xl border border-dashed border-white/15 text-white/50">
                                        Sin imagen
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>

                </section>

                <div className="flex gap-2 pt-2">
                    <button
                        disabled={busy}
                        className="px-4 py-2 rounded-xl text-white font-medium
                       bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {busy ? 'Guardando…' : submitLabel}
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
