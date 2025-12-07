import { useEffect, useMemo, useState } from 'react';
import { fetchEventBySlug, fetchMyRegistration } from '../services/api';
import RegistrationModal from '../features/events/RegistrationModal';
import SuccessModal from '../features/events/SuccesModal';
import { getCustomerToken } from '../services/customerApi';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import {
    CalendarRange,
    MapPin,
    Trophy,
    Sparkles,
    Users,
    ArrowLeft,
    Info,
} from 'lucide-react';

type EventKind = 'event' | 'tournament';

interface StoreEvent {
    slug: string;
    title: string;
    type: EventKind;
    location?: string | null;
    start_at: string;
    end_at?: string | null;
    capacity?: number | null;
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

    const nav = useNavigate();
    const loc = useLocation();

    const isLogged = !!getCustomerToken();

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

    const handleRegisterClick = () => {
        if (!isLogged) {
            nav('/login', { state: { next: loc.pathname } });
            return;
        }

        setRegOpen(true);
    };


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
                <div className="flex flex-col items-center gap-2 text-white/75">
                    <div className="h-10 w-10 rounded-full border border-white/15 bg-white/5 grid place-items-center">
                        <CalendarRange className="h-5 w-5 animate-pulse" />
                    </div>
                    <p className="text-sm">Cargando evento…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-4xl mx-auto p-4 space-y-6 text-white">
                <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#06B6D4]" />
                        <span className="uppercase tracking-[0.18em]">
                            Eventos &amp; torneos
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full
                               border border-white/10 bg-white/5 hover:bg-white/10 text-[11px]"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        <span>Volver</span>
                    </button>
                </div>

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
                            <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.6),transparent_60%),linear-gradient(135deg,#1f2937_0%,#020617_100%)]" />
                        )}

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.7)_80%)]" />

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]
                                       border border-white/20 bg-black/30 backdrop-blur-sm"
                            >
                                {event.type === 'tournament' ? (
                                    <>
                                        <Trophy className="h-3 w-3 text-amber-300" />
                                        <span className="tracking-[0.16em]">
                                            TORNEO
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3 w-3 text-cyan-300" />
                                        <span className="tracking-[0.16em]">
                                            EVENTO
                                        </span>
                                    </>
                                )}
                            </span>

                            {event.location && (
                                <span
                                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]
                                           border border-white/15 bg-black/25 backdrop-blur-sm text-white/80"
                                >
                                    <MapPin className="h-3 w-3" />
                                    <span className="line-clamp-1">
                                        {event.location}
                                    </span>
                                </span>
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <h1 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow-sm">
                                {event.title}
                            </h1>
                        </div>
                    </div>

                    <div className="px-5 pb-4 pt-3 border-t border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)] text-white">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                                <CalendarRange className="h-4 w-4 opacity-80" />
                                <span>
                                    {fmtDate(event.start_at)}
                                    {event.end_at
                                        ? ` — ${fmtDate(event.end_at)}`
                                        : ''}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-white/60">
                                <MapPin className="h-4 w-4 opacity-80" />
                                <span>
                                    {event.location || 'Ubicación por confirmar'}
                                </span>
                            </div>

                            <div className="ml-auto flex flex-wrap items-center gap-2">
                                {typeof event.capacity === 'number' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border border-white/15 bg-white/5 text-white/75">
                                        <Users className="h-3 w-3" />
                                        <span>
                                            {event.remaining_capacity ?? '—'} /{' '}
                                            {event.capacity} cupos
                                        </span>
                                    </span>
                                )}

                                {alreadyReg && (
                                    <span className="px-2.5 py-1 rounded-lg text-[11px] border border-emerald-400/25 bg-emerald-500/15 text-emerald-200">
                                        Ya estás registrado
                                    </span>
                                )}
                                {event.remaining_capacity === 0 && (
                                    <span className="px-2.5 py-1 rounded-lg text-[11px] border border-rose-400/25 bg-rose-500/15 text-rose-200">
                                        Cupos agotados
                                    </span>
                                )}
                                {event.registration_open === false && (
                                    <span className="px-2.5 py-1 rounded-lg text-[11px] border border-amber-400/25 bg-amber-500/15 text-amber-200">
                                        Registro cerrado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Info className="h-4 w-4 text-[#06B6D4]" />
                        <h2 className="text-[15px] font-semibold text-white/90">
                            Descripción
                        </h2>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                        {event.description ||
                            'Pronto tendremos más detalles sobre este evento.'}
                    </p>
                </section>

                {canRegister && (
                    <div className="flex">
                        <button
                            onClick={handleRegisterClick}
                            className="ml-auto px-5 py-2.5 rounded-2xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                text-white font-semibold shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)] hover:brightness-110"
                        >
                            Registrarme
                        </button>
                    </div>
                )}


                <div className="rounded-[18px] p-5 text-center text-white bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15 border border-white/10">
                    <p className="text-white/90 flex flex-wrap items-center justify-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-[#06B6D4]" />
                        <span>
                            ¿Listo para competir o asistir?{' '}
                            <span className="font-semibold text-[#06B6D4]">
                                ¡Nos vemos en el evento!
                            </span>
                        </span>
                    </p>
                </div>
            </div>

            <RegistrationModal
                slug={slug!}
                open={regOpen && isLogged}
                onClose={() => setRegOpen(false)}
                onSuccess={(msg) => {
                    setSuccessMsg(
                        msg || 'Registro recibido. Te contactaremos para confirmar.',
                    );
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
