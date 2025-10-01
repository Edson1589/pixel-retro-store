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

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const date = d
        .toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
        .replace('.', '');
    const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return `${date} — ${time}`;
};

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
            setBusy(true);
            setMsg(null);

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
        } finally {
            setBusy(false);
        }
    };

    if (!event) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B]">
                <p className="text-white/70">Cargando…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* HERO/BANNER */}
                <section className="rounded-[22px] overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                    <div className="relative aspect-video">
                        {event.banner_url ? (
                            <img
                                src={event.banner_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full bg-[linear-gradient(135deg,#2A3342_0%,#202836_100%)]" />
                        )}

                        {/* Overlay gradiente suave */}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0)_0%,rgba(0,0,0,0.55)_85%)]" />

                        {/* Título sobre el banner */}
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/75">
                                <span className="rounded-md px-2 py-1 bg-white/10 border border-white/15">
                                    {event.type === 'tournament' ? 'TORNEO' : 'EVENTO'}
                                </span>
                                {event.location && (
                                    <span className="hidden sm:inline text-white/60">· {event.location}</span>
                                )}
                            </div>
                            <h1 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow">
                                {event.title}
                            </h1>
                        </div>
                    </div>

                    {/* Meta bajo el banner */}
                    <div className="px-5 pb-4 pt-3 border-t border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)] text-white">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                                {/* calendario */}
                                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
                                    <path d="M7 2v2M17 2v2M4 7h16M5 22h14a2 2 0 0 0 2-2V7H3v13a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                                <span>
                                    {fmtDate(event.start_at)}
                                    {event.end_at ? ` — ${fmtDate(event.end_at)}` : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                {/* ubicación */}
                                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
                                    <path d="M12 21s7-7 7-11a7 7 0 1 0-14 0c0 4 7 11 7 11Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <circle cx="12" cy="10" r="2" fill="currentColor" />
                                </svg>
                                <span>{event.location || 'Ubicación por confirmar'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DESCRIPCIÓN */}
                <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10">
                    <h2 className="text-[15px] font-semibold mb-2 text-white/90">Descripción</h2>
                    <p className="text-white/80 leading-relaxed">
                        {event.description || 'Pronto tendremos más detalles sobre este evento.'}
                    </p>
                </section>

                {/* REGISTRO */}
                <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10">
                    <h3 className="text-[15px] font-semibold mb-3 text-white/90">Registro</h3>

                    <div className="grid md:grid-cols-2 gap-3">
                        <input
                            className="w-full rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Nombre"
                            value={form.name}
                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                setForm((s) => ({ ...s, name: ev.target.value }))
                            }
                        />
                        <input
                            className="w-full rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Email"
                            value={form.email}
                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                setForm((s) => ({ ...s, email: ev.target.value }))
                            }
                        />
                        <input
                            className="w-full rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Gamer tag (opcional)"
                            value={form.gamer_tag}
                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                setForm((s) => ({ ...s, gamer_tag: ev.target.value }))
                            }
                        />
                        <input
                            className="w-full rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Equipo (opcional)"
                            value={form.team}
                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                setForm((s) => ({ ...s, team: ev.target.value }))
                            }
                        />
                        <textarea
                            className="md:col-span-2 rounded-xl px-3 py-2
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            rows={4}
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
                        className="mt-4 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)] text-white font-medium
                       shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                       hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy ? 'Enviando...' : 'Registrarme'}
                    </button>

                    {msg && (
                        <p className="mt-3 text-sm text-[#06B6D4]">
                            {msg}
                        </p>
                    )}
                </section>

                {/* CTA/footer sutil */}
                <div className="rounded-[18px] p-5 text-center text-white
                        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15
                        border border-white/10">
                    <p className="text-white/90">
                        ¿Listo para competir o asistir? <span className="font-semibold text-[#06B6D4]">¡Nos vemos en el evento!</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
