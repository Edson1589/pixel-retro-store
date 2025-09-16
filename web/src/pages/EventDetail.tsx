import { useEffect, useState } from 'react';
import { fetchEventBySlug, registerToEvent } from '../services/api';
import { getCustomerToken } from '../services/customerApi';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

type EventKind = 'event' | 'tournament';

interface StoreEvent {
    slug: string;
    title: string;
    type: EventKind;
    location?: string | null;
    start_at: string;
    end_at?: string | null;
    description?: string | null;
    banner_url?: string | null;
}

interface RegistrationForm {
    name: string;
    email: string;
    gamer_tag: string;
    team: string;
    notes: string;
}

interface RegisterResponse {
    message?: string;
}

export default function EventDetail() {
    const { slug } = useParams<{ slug: string }>();

    const [event, setEvent] = useState<StoreEvent | null>(null);
    const [form, setForm] = useState<RegistrationForm>({
        name: '',
        email: '',
        gamer_tag: '',
        team: '',
        notes: '',
    });
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            if (!slug) return;
            const data = (await fetchEventBySlug(slug)) as StoreEvent;
            setEvent(data);
        })();
    }, [slug]);

    const nav = useNavigate();
    const loc = useLocation();

    const submit = async () => {
        if (!slug) return;
        try {
            setBusy(true); setMsg(null);

            if (!getCustomerToken()) {
                nav('/login', { state: { next: loc.pathname } });
                return;
            }

            const res = (await registerToEvent(slug, form)) as RegisterResponse;
            setMsg(res?.message ?? 'Registro enviado');
            setForm({ name: '', email: '', gamer_tag: '', team: '', notes: '' });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error en registro';
            setMsg(message);
        } finally { setBusy(false); }
    };

    if (!event) return <p>Cargando...</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                {event.banner_url ? (
                    <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : null}
            </div>

            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="text-sm text-gray-600">
                {event.type === 'tournament' ? 'Torneo' : 'Evento'} · {event.location || '—'}
            </div>
            <div className="text-sm text-gray-600">
                {new Date(event.start_at).toLocaleString()}{" "}
                {event.end_at && `— ${new Date(event.end_at).toLocaleString()}`}
            </div>
            <p>{event.description || '—'}</p>

            <div className="border rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Registro</h3>
                <div className="grid md:grid-cols-2 gap-2">
                    <input
                        className="border rounded-xl px-3 py-2"
                        placeholder="Nombre"
                        value={form.name}
                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                            setForm((s) => ({ ...s, name: ev.target.value }))
                        }
                    />
                    <input
                        className="border rounded-xl px-3 py-2"
                        placeholder="Email"
                        value={form.email}
                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                            setForm((s) => ({ ...s, email: ev.target.value }))
                        }
                    />
                    <input
                        className="border rounded-xl px-3 py-2"
                        placeholder="Gamer tag (opcional)"
                        value={form.gamer_tag}
                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                            setForm((s) => ({ ...s, gamer_tag: ev.target.value }))
                        }
                    />
                    <input
                        className="border rounded-xl px-3 py-2"
                        placeholder="Equipo (opcional)"
                        value={form.team}
                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                            setForm((s) => ({ ...s, team: ev.target.value }))
                        }
                    />
                    <textarea
                        className="border rounded-xl px-3 py-2 md:col-span-2"
                        rows={3}
                        placeholder="Notas (opcional)"
                        value={form.notes}
                        onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setForm((s) => ({ ...s, notes: ev.target.value }))
                        }
                    />
                </div>
                <button
                    disabled={busy || !form.name || !form.email}
                    onClick={submit}
                    className="mt-3 px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                >
                    {busy ? 'Enviando...' : 'Registrarme'}
                </button>
                {msg && <p className="mt-2">{msg}</p>}
            </div>
        </div>
    );
}
