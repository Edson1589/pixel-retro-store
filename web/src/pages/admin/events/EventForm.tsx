import { useEffect, useMemo, useState } from 'react';
import FancySelect, { type Option } from "../../../components/FancySelect";
import {
    CalendarRange,
    ArrowLeft,
    Type,
    Hash,
    Gamepad2,
    MapPin,
    CalendarClock,
    Users,
    BadgeCheck,
    Clock3,
    AlignLeft,
    Image as ImageIcon,
} from 'lucide-react';

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
        <div className="flex justify-center">
            <div className="w-full max-w-3xl text-white space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                           bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                           shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                           flex items-center justify-center"
                        >
                            <CalendarRange className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                                   bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                {initial ? 'Editar evento / torneo' : 'Nuevo evento / torneo'}
                            </h2>
                            <p className="text-xs text-white/60">
                                Define título, lugar, fechas y registro para tu evento retro.
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
                    onSubmit={submit}
                    className="mt-1 rounded-2xl border border-white/10 p-4 md:p-5 bg-white/[0.04]
                           w-full space-y-7 shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]"
                >
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            <div className="h-6 w-6 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center">
                                <Type className="h-3.5 w-3.5" />
                            </div>
                            <span>Datos principales</span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Type className="h-3 w-3" />
                                    <span>Título</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Type className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        className={`${inputCls} pl-9 pr-3 text-sm`}
                                        placeholder="Ej: Torneo Retro Fighters – Edición 2025"
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm((s) => ({ ...s, title: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    <span>Slug</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Hash className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        className={`${inputCls} pl-9 pr-3 text-sm`}
                                        placeholder="torneo-retro-fighters"
                                        value={form.slug}
                                        onChange={(e) =>
                                            setForm((s) => ({ ...s, slug: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Gamepad2 className="h-3 w-3" />
                                    <span>Tipo</span>
                                </label>
                                <FancySelect
                                    className="min-w-[160px]"
                                    value={form.type}
                                    onChange={(v) =>
                                        setForm((s) => ({ ...s, type: v as EventKind }))
                                    }
                                    options={kindOptions}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#06B6D4]">
                            <div className="h-6 w-6 rounded-full bg-violet-500/10 border border-violet-400/40 flex items-center justify-center">
                                <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <span>Detalles y agenda</span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3">
                            <div className="md:col-span-1">
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>Lugar</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        className={`${inputCls} pl-9 pr-3 text-sm`}
                                        placeholder="Pixel Retro HQ, sala principal…"
                                        value={form.location}
                                        onChange={(e) =>
                                            setForm((s) => ({ ...s, location: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <CalendarClock className="h-3 w-3" />
                                    <span>Fecha inicio</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <CalendarClock className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        required
                                        className={`${withError('start_at')} pl-9 pr-3 text-sm`}
                                        type="datetime-local"
                                        value={form.start_at}
                                        min={nowInput}
                                        max={form.end_at || undefined}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                start_at: e.target.value,
                                            }))
                                        }
                                        aria-invalid={!!errors.start_at}
                                        aria-describedby={
                                            errors.start_at ? 'err-start' : undefined
                                        }
                                    />
                                </div>
                                {errors.start_at && (
                                    <p id="err-start" className="text-red-500 text-xs mt-1">
                                        {errors.start_at}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <CalendarClock className="h-3 w-3" />
                                    <span>Fecha fin</span>
                                </label>
                                <div className="relative">
                                    <CalendarClock className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        className={`${withError('end_at')} pl-9 pr-3 text-sm`}
                                        type="datetime-local"
                                        value={form.end_at}
                                        min={form.start_at || nowInput}
                                        onChange={(e) =>
                                            setForm((s) => ({ ...s, end_at: e.target.value }))
                                        }
                                        aria-invalid={!!errors.end_at}
                                        aria-describedby={
                                            errors.end_at ? 'err-end' : undefined
                                        }
                                    />
                                </div>
                                {errors.end_at && (
                                    <p id="err-end" className="text-red-500 text-xs mt-1">
                                        {errors.end_at}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>Capacidad</span>
                                </label>
                                <div className="relative">
                                    <Users className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        className={`${inputCls} pl-9 pr-3 text-sm`}
                                        type="number"
                                        placeholder="Capacidad (opcional)"
                                        value={form.capacity}
                                        onChange={(e) =>
                                            setForm((s) => ({ ...s, capacity: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <BadgeCheck className="h-3 w-3" />
                                    <span>Estado</span>
                                </label>
                                <FancySelect
                                    className="min-w-[160px]"
                                    value={form.status}
                                    onChange={(v) =>
                                        setForm((s) => ({ ...s, status: v as EventStatus }))
                                    }
                                    options={statusOptions}
                                />
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Clock3 className="h-3 w-3" />
                                    <span>Apertura de registro</span>
                                </label>
                                <div className="relative">
                                    <Clock3 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        className={`${withError('registration_open_at')} pl-9 pr-3 text-sm`}
                                        type="datetime-local"
                                        value={form.registration_open_at}
                                        max={maxRegOpen}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                registration_open_at: e.target.value,
                                            }))
                                        }
                                        aria-invalid={!!errors.registration_open_at}
                                        aria-describedby={
                                            errors.registration_open_at ? 'err-ro' : undefined
                                        }
                                    />
                                </div>
                                {errors.registration_open_at && (
                                    <p id="err-ro" className="text-red-500 text-xs mt-1">
                                        {errors.registration_open_at}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                    <Clock3 className="h-3 w-3" />
                                    <span>Cierre de registro</span>
                                </label>
                                <div className="relative">
                                    <Clock3 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        className={`${withError('registration_close_at')} pl-9 pr-3 text-sm`}
                                        type="datetime-local"
                                        value={form.registration_close_at}
                                        min={form.registration_open_at || undefined}
                                        max={form.start_at || undefined}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                registration_close_at: e.target.value,
                                            }))
                                        }
                                        aria-invalid={!!errors.registration_close_at}
                                        aria-describedby={
                                            errors.registration_close_at ? 'err-rc' : undefined
                                        }
                                    />
                                </div>
                                {errors.registration_close_at && (
                                    <p id="err-rc" className="text-red-500 text-xs mt-1">
                                        {errors.registration_close_at}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <AlignLeft className="h-3 w-3" />
                                <span>Descripción</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                className={`${inputCls} md:h-28 text-sm`}
                                placeholder="Detalles del evento, reglas, premios, dinámica…"
                                value={form.description}
                                onChange={(e) =>
                                    setForm((s) => ({
                                        ...s,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/60 mb-1 flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                <span>Imagen / banner</span>
                            </label>
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
                                bg-white/[0.05] text-white/90 border border-white/10 text-sm"
                            />
                            {bannerError && (
                                <p className="mt-1 text-xs text-rose-400">{bannerError}</p>
                            )}

                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="text-xs text-white/60 mb-2">Vista previa</div>
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview del banner"
                                        className="max-h-48 w-full object-cover rounded-xl border border-white/10"
                                    />
                                ) : (
                                    <div className="h-32 grid place-items-center rounded-xl border border-dashed border-white/15 text-white/50 text-xs">
                                        Sin imagen seleccionada
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex gap-2 pt-2">
                        <button
                            disabled={busy}
                            className="h-11 px-4 rounded-xl text-white font-medium
                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 transition
                           shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                           disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {busy ? 'Guardando…' : submitLabel}
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="h-11 px-4 rounded-xl border border-white/15 text-white/80
                           hover:bg-white/5 text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
