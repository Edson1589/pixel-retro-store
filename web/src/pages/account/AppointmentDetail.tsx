import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Appointment } from '../../types';
import { customerShowAppointment } from '../../services/customerAppointmentsApi';
import {
    CalendarRange,
    Clock,
    Gamepad2,
    MapPin,
    FileText,
    AlertCircle,
    ArrowLeft,
    Timer,
    Info,
} from 'lucide-react';

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border';
    if (s.includes('completed')) {
        return `${base} bg-emerald-500/10 text-emerald-300 border-emerald-400/30`;
    }
    if (s.includes('confirmed')) {
        return `${base} bg-sky-500/10 text-sky-300 border-sky-400/30`;
    }
    if (s.includes('pending') || s.includes('resched')) {
        return `${base} bg-amber-500/10 text-amber-300 border-amber-400/30`;
    }
    if (s.includes('rejected') || s.includes('cancel')) {
        return `${base} bg-rose-500/10 text-rose-300 border-rose-400/30`;
    }
    return `${base} bg-white/10 text-white/80 border-white/20`;
};

export default function AppointmentDetail() {
    const { id } = useParams();
    const [a, setA] = useState<Appointment | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setMsg(null);
                setA(await customerShowAppointment(Number(id)));
            } catch (e) {
                setMsg(e instanceof Error ? e.message : 'Error cargando la cita');
            }
        })();
    }, [id]);

    if (msg) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
                <div className="w-full max-w-md rounded-[22px] p-6 bg-white/[0.04] border border-white/10 text-white shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)]">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <AlertCircle className="h-5 w-5 text-rose-300" />
                        </div>
                        <div>
                            <p className="text-sm text-rose-300">{msg}</p>
                            <Link
                                to="/account/appointments"
                                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver a mis citas
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!a) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
                <p className="text-white/70">Cargando…</p>
            </div>
        );
    }

    const isHome = a.location === 'home';

    return (
        <div className="min-h-screen bg-[#07101B] text-white">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <section
                    className="rounded-[20px] px-6 py-5
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                     shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                     border border-white/10 text-white"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/account/appointments"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                               bg-white/10 hover:bg-white/15 border border-white/15 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-extrabold tracking-wider flex items-center gap-2">
                                    <CalendarRange className="h-5 w-5" />
                                    <span>Cita #{a.id}</span>
                                </h1>
                                <span className={statusBadge(a.status)}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {a.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-white/90 flex items-center gap-2">
                                <Info className="h-4 w-4 opacity-80" />
                                Detalle de la cita y su estado actual.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-4">
                    <section className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 space-y-3">
                        <h2 className="text-[15px] font-semibold mb-1 text-white/90 flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4 text-[#06B6D4]" />
                            <span>Detalle del servicio</span>
                        </h2>

                        <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-white/60 text-xs uppercase tracking-[0.14em]">
                                    Tipo de servicio
                                </span>
                            </div>
                            <p className="font-medium text-white/90">
                                {a.service_type === 'repair'
                                    ? 'Reparación'
                                    : a.service_type === 'maintenance'
                                        ? 'Mantenimiento'
                                        : a.service_type === 'diagnostic'
                                            ? 'Diagnóstico'
                                            : a.service_type}
                            </p>
                        </div>

                        <div className="space-y-1.5 text-sm">
                            <span className="text-white/60 text-xs uppercase tracking-[0.14em]">
                                Consola
                            </span>
                            <p className="font-medium text-white/90 flex items-center gap-2">
                                <Gamepad2 className="h-4 w-4 text-white/60" />
                                {a.console || 'No especificada'}
                            </p>
                        </div>

                        <div className="space-y-1.5 text-sm">
                            <span className="text-white/60 text-xs uppercase tracking-[0.14em]">
                                Lugar
                            </span>
                            <p className="font-medium text-white/90 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-white/60" />
                                {isHome ? 'Servicio a domicilio' : 'En taller'}
                            </p>
                            {isHome && a.address && (
                                <p className="text-xs text-white/70 pl-6">{a.address}</p>
                            )}
                        </div>

                        {typeof a.duration_minutes === 'number' && (
                            <div className="space-y-1.5 text-sm">
                                <span className="text-white/60 text-xs uppercase tracking-[0.14em]">
                                    Duración estimada
                                </span>
                                <p className="font-medium text-white/90 flex items-center gap-2">
                                    <Timer className="h-4 w-4 text-white/60" />
                                    {a.duration_minutes} minutos
                                </p>
                            </div>
                        )}

                        {a.customer_notes && (
                            <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-sm">
                                <div className="flex items-center gap-2 mb-1 text-xs text-white/60 uppercase tracking-[0.14em]">
                                    <FileText className="h-3 w-3" />
                                    <span>Notas que enviaste</span>
                                </div>
                                <p className="text-white/80 whitespace-pre-wrap">
                                    {a.customer_notes}
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 space-y-4">
                        <h2 className="text-[15px] font-semibold mb-1 text-white/90 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#06B6D4]" />
                            <span>Fechas y estado</span>
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <CalendarRange className="h-4 w-4 mt-0.5 text-white/60" />
                                <div>
                                    <div className="text-xs text-white/60 uppercase tracking-[0.14em]">
                                        Fecha preferida
                                    </div>
                                    <div className="font-medium text-white/90">
                                        {formatDateTime(a.preferred_at)}
                                    </div>
                                </div>
                            </div>

                            {a.scheduled_at && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 mt-0.5 text-emerald-300" />
                                    <div>
                                        <div className="text-xs text-white/60 uppercase tracking-[0.14em]">
                                            Cita agendada por el técnico
                                        </div>
                                        <div className="font-medium text-white/90">
                                            {formatDateTime(a.scheduled_at)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {a.reschedule_proposed_at && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 mt-0.5 text-amber-300" />
                                    <div>
                                        <div className="text-xs text-white/60 uppercase tracking-[0.14em]">
                                            Nueva propuesta de horario
                                        </div>
                                        <div className="font-medium text-white/90">
                                            {formatDateTime(a.reschedule_proposed_at)}
                                        </div>
                                        {a.reschedule_note && (
                                            <p className="mt-1 text-xs text-white/70">
                                                {a.reschedule_note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {a.reject_reason && (
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-4 w-4 mt-0.5 text-rose-300" />
                                    <div>
                                        <div className="text-xs text-white/60 uppercase tracking-[0.14em]">
                                            Motivo de rechazo/cancelación
                                        </div>
                                        <p className="font-medium text-rose-200 text-sm">
                                            {a.reject_reason}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="rounded-[18px] p-5 text-center text-white
                        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15
                        border border-white/10">
                    <p className="text-white/90 text-sm md:text-base flex flex-wrap items-center justify-center gap-2">
                        ¿Tienes dudas sobre esta cita?
                        <span className="font-semibold text-[#06B6D4]">
                            Contáctanos y te ayudamos.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
