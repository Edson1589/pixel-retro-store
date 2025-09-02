import { useEffect, useMemo, useState } from 'react';

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

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
    start_at?: string | null;                 // ISO string
    end_at?: string | null;                   // ISO string
    capacity?: number | string | null;
    status?: EventStatus | null;
    registration_open_at?: string | null;     // ISO string
    registration_close_at?: string | null;    // ISO string
    banner_url?: string | null;
};

type EventFormState = {
    title: string;
    slug: string;
    type: EventKind;
    description: string;
    location: string;
    start_at: string;               // 'YYYY-MM-DDTHH:mm'
    end_at: string;                 // 'YYYY-MM-DDTHH:mm'
    capacity: string;               // lo guardamos como string; se envía como string
    status: EventStatus;
    registration_open_at: string;   // 'YYYY-MM-DDTHH:mm'
    registration_close_at: string;  // 'YYYY-MM-DDTHH:mm'
    banner: File | null;
    banner_url: string;             // URL existente (cuando se edita)
};

export default function EventForm({ initial, onSubmit, submitLabel = 'Guardar' }: Props) {
    const [busy, setBusy] = useState(false);

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
        registration_open_at: initial?.registration_open_at
            ? initial.registration_open_at.substring(0, 16)
            : '',
        registration_close_at: initial?.registration_close_at
            ? initial.registration_close_at.substring(0, 16)
            : '',
        banner: null,
        banner_url: initial?.banner_url ?? '',
    });

    const preview = useMemo<string | null>(() => {
        if (form.banner) return URL.createObjectURL(form.banner);
        return form.banner_url || null;
    }, [form.banner, form.banner_url]);

    // Limpia el ObjectURL cuando cambie el archivo o al desmontar
    useEffect(() => {
        return () => {
            if (preview && form.banner) URL.revokeObjectURL(preview);
        };
    }, [preview, form.banner]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setBusy(true);
        try {
            const fd = new FormData();

            // Campos string que se envían tal cual
            const keys: Array<
                keyof Pick<
                    EventFormState,
                    | 'title'
                    | 'slug'
                    | 'type'
                    | 'description'
                    | 'location'
                    | 'start_at'
                    | 'end_at'
                    | 'capacity'
                    | 'status'
                    | 'registration_open_at'
                    | 'registration_close_at'
                >
            > = [
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
                ];

            for (const k of keys) {
                const v = form[k];
                if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
            }

            if (form.banner) fd.append('banner', form.banner);

            await onSubmit(fd);
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-3">
            <div className="grid md:grid-cols-3 gap-2">
                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Título"
                    value={form.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, title: e.target.value }))
                    }
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="slug-evento"
                    value={form.slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, slug: e.target.value }))
                    }
                />
                <select
                    className="border rounded-xl px-3 py-2"
                    value={form.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setForm((s) => ({ ...s, type: e.target.value as EventKind }))
                    }
                >
                    <option value="event">Evento</option>
                    <option value="tournament">Torneo</option>
                </select>

                <input
                    className="border rounded-xl px-3 py-2"
                    placeholder="Lugar"
                    value={form.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, location: e.target.value }))
                    }
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="datetime-local"
                    value={form.start_at}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, start_at: e.target.value }))
                    }
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="datetime-local"
                    value={form.end_at}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, end_at: e.target.value }))
                    }
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="number"
                    placeholder="Capacidad (opcional)"
                    value={form.capacity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, capacity: e.target.value }))
                    }
                />
                <select
                    className="border rounded-xl px-3 py-2"
                    value={form.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setForm((s) => ({ ...s, status: e.target.value as EventStatus }))
                    }
                >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                </select>
                <input
                    className="border rounded-xl px-3 py-2"
                    type="datetime-local"
                    value={form.registration_open_at}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, registration_open_at: e.target.value }))
                    }
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="datetime-local"
                    value={form.registration_close_at}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({ ...s, registration_close_at: e.target.value }))
                    }
                />
                <input
                    className="border rounded-xl px-3 py-2"
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((s) => ({
                            ...s,
                            banner: e.target.files?.[0] ?? null,
                        }))
                    }
                />
            </div>

            {preview && (
                <img
                    src={preview}
                    alt="Preview del banner"
                    className="max-h-48 rounded-xl border"
                />
            )}

            <button disabled={busy} className="px-4 py-2 rounded-xl bg-black text-white">
                {busy ? 'Guardando...' : submitLabel}
            </button>
        </form>
    );
}
