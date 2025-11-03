import { useEffect, useMemo, useState } from 'react';
import { fetchEventBySlug, fetchMyRegistration } from '../services/api';
import RegistrationModal from '../features/events/RegistrationModal';
import SuccessModal from '../features/events/SuccesModal';
import { getCustomerToken } from '../services/customerApi';
import { useParams } from 'react-router-dom';

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
    registration_open?: boolean;
    remaining_capacity?: number | null;
}

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return `${date} — ${time}`;
};

export default function EventDetail() {
    const { slug } = useParams<{ slug: string }>();

    const [event, setEvent] = useState<StoreEvent | null>(null);
    const [regOpen, setRegOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState('Registro recibido. Te contactaremos para confirmar.');

    const [alreadyReg, setAlreadyReg] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const data = await fetchEventBySlug(slug) as StoreEvent;
                setEvent(data);


                if (getCustomerToken()) {
                    try {
                        const res = await fetchMyRegistration(slug);
                        setAlreadyReg(!!res?.registered);
                    } catch {
                        setAlreadyReg(false);
                    }
                } else {
                    setAlreadyReg(false);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    const canRegister = useMemo(() => {
        if (!event) return false;
        if (alreadyReg) return false;
        if (event.registration_open === false) return false;
        if (event.remaining_capacity === 0) return false;
        return true;
    }, [event, alreadyReg]);

    if (!event || loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B]">
                <p className="text-white/70">Cargando…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <section className="rounded-[22px] overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                    <div className="relative aspect-video">
                        {event.banner_url ? (
                            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="w-full h-full bg-[linear-gradient(135deg,#2A3342_0%,#202836_100%)]" />
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0)_0%,rgba(0,0,0,0.55)_85%)]" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/75">
                                <span className="rounded-md px-2 py-1 bg-white/10 border border-white/15">
                                    {event.type === 'tournament' ? 'TORNEO' : 'EVENTO'}
                                </span>
                                {event.location && <span className="hidden sm:inline text-white/60">· {event.location}</span>}
                            </div>
                            <h1 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow">{event.title}</h1>
                        </div>
                    </div>

                    <div className="px-5 pb-4 pt-3 border-t border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)] text-white">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
                                    <path d="M7 2v2M17 2v2M4 7h16M5 22h14a2 2 0 0 0 2-2V7H3v13a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                                <span>
                                    {fmtDate(event.start_at)}
                                    {event.end_at ? ` — ${fmtDate(event.end_at)}` : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
                                    <path d="M12 21s7-7 7-11a7 7 0 1 0-14 0c0 4 7 11 7 11Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <circle cx="12" cy="10" r="2" fill="currentColor" />
                                </svg>
                                <span>{event.location || 'Ubicación por confirmar'}</span>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                {alreadyReg && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs border border-emerald-400/25 bg-emerald-500/15 text-emerald-200">
                                        Ya estás registrado
                                    </span>
                                )}
                                {event.remaining_capacity === 0 && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs border border-rose-400/25 bg-rose-500/15 text-rose-200">
                                        Cupos agotados
                                    </span>
                                )}
                                {event.registration_open === false && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs border border-amber-400/25 bg-amber-500/15 text-amber-200">
                                        Registro cerrado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10">
                    <h2 className="text-[15px] font-semibold mb-2 text-white/90">Descripción</h2>
                    <p className="text-white/80 leading-relaxed">
                        {event.description || 'Pronto tendremos más detalles sobre este evento.'}
                    </p>
                </section>

                {canRegister && (
                    <div className="flex">
                        <button
                            onClick={() => setRegOpen(true)}
                            className="ml-auto px-5 py-2.5 rounded-2xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                text-white font-semibold shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)] hover:brightness-110"
                        >
                            Registrarme
                        </button>
                    </div>
                )}

                <div className="rounded-[18px] p-5 text-center text-white bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15 border border-white/10">
                    <p className="text-white/90">
                        ¿Listo para competir o asistir? <span className="font-semibold text-[#06B6D4]">¡Nos vemos en el evento!</span>
                    </p>
                </div>
            </div>

            <RegistrationModal
                slug={slug!}
                open={regOpen}
                onClose={() => setRegOpen(false)}
                onSuccess={(msg) => {
                    setSuccessMsg(msg || 'Registro recibido. Te contactaremos para confirmar.');
                    setSuccessOpen(true);
                    setAlreadyReg(true);
                }}
            />

            <SuccessModal
                open={successOpen}
                onClose={() => setSuccessOpen(false)}
                message={successMsg}
            />
        </div>
    );
}
