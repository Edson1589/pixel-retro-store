import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Appointment } from '../../types';
import { customerListAppointments, customerCancelAppointment, customerConfirmReschedule } from '../../services/customerAppointmentsApi';
import {
    ClipboardList,
    PlusCircle,
    Filter,
    CalendarClock,
    Gamepad2,
    MapPin,
    Phone,
    Clock3,
    CheckCircle2,
    XCircle,
    AlertCircle,
    History,
} from 'lucide-react';

import AppointmentNewModal from '../../features/appointments/AppointmentNewModal';
import FancySelect, { type Option } from '../../components/FancySelect';

const STATUS_FILTERS = [
    'all', 'pending', 'confirmed', 'rescheduled', 'completed', 'rejected', 'cancelled',
] as const;
type AppointmentStatusFilter = typeof STATUS_FILTERS[number];

export default function AccountAppointments() {
    const [items, setItems] = useState<Appointment[]>([]);
    const [status, setStatus] = useState<AppointmentStatusFilter>('all');
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);
    const [showNew, setShowNew] = useState(false);

    const load = async () => {
        setLoading(true); setMsg(null);
        try {
            const r = await customerListAppointments({ status: status === 'all' ? undefined : status, per_page: 100 });
            setItems(r.data);
        } catch (e) { setMsg(e instanceof Error ? e.message : 'Error cargando citas'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [status]);

    const cancel = async (id: number) => {
        if (!confirm('¿Cancelar esta cita?')) return;
        try { await customerCancelAppointment(id); await load(); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
    };

    const acceptResched = async (id: number, accept: boolean) => {
        try { await customerConfirmReschedule(id, accept); await load(); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
    };


    const STATUS_OPTIONS: Option[] = [
        { value: 'all', label: 'Todos' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'confirmed', label: 'Confirmada' },
        { value: 'rescheduled', label: 'Reprogramación' },
        { value: 'completed', label: 'Completada' },
        { value: 'rejected', label: 'Rechazada' },
        { value: 'cancelled', label: 'Cancelada' },
    ];

    const onStatusChange = (v: string) => {
        if (STATUS_FILTERS.includes(v as AppointmentStatusFilter)) {
            setStatus(v as AppointmentStatusFilter);
        }
    };

    const renderStatusChip = (status: string) => {
        const s = status.toLowerCase();
        let cls =
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ';
        let label = status;
        let Icon: React.ComponentType<{ className?: string }> = Clock3;

        switch (s) {
            case 'pending':
                cls += 'bg-amber-500/10 text-amber-200 border-amber-400/40';
                label = 'Pendiente';
                Icon = Clock3;
                break;
            case 'confirmed':
                cls += 'bg-emerald-500/10 text-emerald-200 border-emerald-400/40';
                label = 'Confirmada';
                Icon = CheckCircle2;
                break;
            case 'rescheduled':
                cls += 'bg-sky-500/10 text-sky-200 border-sky-400/40';
                label = 'Reprogramación';
                Icon = History;
                break;
            case 'completed':
                cls += 'bg-emerald-500/10 text-emerald-200 border-emerald-400/40';
                label = 'Completada';
                Icon = CheckCircle2;
                break;
            case 'rejected':
            case 'cancelled':
                cls += 'bg-rose-500/10 text-rose-200 border-rose-400/40';
                label = s === 'rejected' ? 'Rechazada' : 'Cancelada';
                Icon = XCircle;
                break;
            default:
                cls += 'bg-white/10 text-white/80 border-white/20';
                label = status;
                Icon = AlertCircle;
        }

        return (
            <span className={cls}>
                <Icon className="h-3 w-3" />
                <span>{label}</span>
            </span>
        );
    };


    return (
        <div className="min-h-screen bg-[#07101B] text-white">
            <div className="max-w-5xl mx-auto p-4 space-y-5">
                {/* Banner superior */}
                <section
                    className="rounded-[20px] px-8 py-6 text-white
                bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                border border-white/10"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-wider">
                                    Mis citas
                                </h1>
                                <p className="mt-1 text-sm text-white/90">
                                    Gestiona tus citas de servicio técnico y revisa su estado.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowNew(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                        bg-[linear-gradient(90deg,#1EE0A1_0%,#06B6D4_100%)]
                        text-sm font-semibold shadow-[0_12px_30px_-12px_rgba(34,197,94,0.8)]
                        hover:brightness-110"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Solicitar cita</span>
                        </button>
                    </div>
                </section>

                {/* Filtro por estado */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 text-sm text-white/80">
                        <Filter className="h-4 w-4 text-white/60" />
                        <span>Estado:</span>
                    </div>

                    <FancySelect
                        value={status}
                        onChange={onStatusChange}
                        options={STATUS_OPTIONS}
                        placeholder="Todos"
                        className="w-52"
                    />
                </div>


                {msg && (
                    <p className="mt-2 text-sm text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        <span>{msg}</span>
                    </p>
                )}

                {loading ? (
                    <p className="mt-6 opacity-70 flex items-center gap-2 text-sm">
                        <Clock3 className="h-4 w-4 animate-pulse" />
                        <span>Cargando…</span>
                    </p>
                ) : (
                    <div className="mt-4 grid gap-3">
                        {items.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/80 flex items-center gap-2">
                                <History className="h-4 w-4 text-white/50" />
                                <span>No tienes citas.</span>
                            </div>
                        )}

                        {items.map((a) => (
                            <div
                                key={a.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4
                            shadow-[0_16px_40px_-24px_rgba(2,6,23,0.8)]"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    {/* Info principal */}
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Gamepad2 className="h-5 w-5 text-[#06B6D4]" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="font-semibold">
                                                    {a.service_type.toUpperCase()} • {a.console}
                                                </div>
                                                {renderStatusChip(a.status)}
                                            </div>

                                            <div className="mt-1 text-xs sm:text-sm text-white/70 flex flex-wrap gap-x-3 gap-y-1">
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarClock className="h-3 w-3" />
                                                    <span>
                                                        Preferida:{' '}
                                                        {new Date(a.preferred_at).toLocaleString()}
                                                    </span>
                                                </span>
                                                {a.scheduled_at && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock3 className="h-3 w-3" />
                                                        <span>
                                                            Agendada:{' '}
                                                            {new Date(
                                                                a.scheduled_at
                                                            ).toLocaleString()}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 text-xs text-white/60 flex flex-wrap gap-x-3 gap-y-1">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>
                                                        {a.location === 'home'
                                                            ? 'Servicio a domicilio'
                                                            : 'En taller'}
                                                    </span>
                                                </span>
                                                {a.contact_phone && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{a.contact_phone}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        {a.status === 'confirmed' && (
                                            <button
                                                onClick={() => cancel(a.id)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                       text-[11px] border border-white/15 bg-white/[0.05]
                       text-white/80 hover:bg-white/10 transition-colors"
                                            >
                                                <XCircle className="h-3 w-3" />
                                                <span>Cancelar</span>
                                            </button>
                                        )}

                                        {a.status === 'rescheduled' && (
                                            <>
                                                <button
                                                    onClick={() => acceptResched(a.id, true)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                           text-[11px] border border-emerald-400/35 bg-emerald-500/10
                           text-emerald-100 hover:bg-emerald-500/15 transition-colors"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Aceptar</span>
                                                </button>

                                                <button
                                                    onClick={() => acceptResched(a.id, false)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   text-[11px] border border-rose-400/30 bg-rose-500/10
                   hover:bg-rose-500/15
                   disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    <span>Rechazar</span>
                                                </button>
                                            </>
                                        )}

                                        <Link
                                            to={`/account/appointments/${a.id}`}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   text-[11px] border border-cyan-400/35 bg-cyan-500/10
                   text-cyan-100 hover:bg-cyan-500/15 transition-colors"
                                        >
                                            <CalendarClock className="h-3 w-3" />
                                            <span>Ver</span>
                                        </Link>
                                    </div>

                                </div>

                                {a.status === 'rescheduled' &&
                                    a.reschedule_proposed_at && (
                                        <p className="text-sm mt-2 opacity-90">
                                            Nueva propuesta:{' '}
                                            <strong>
                                                {new Date(
                                                    a.reschedule_proposed_at
                                                ).toLocaleString()}
                                            </strong>
                                            {a.reschedule_note
                                                ? ` — ${a.reschedule_note}`
                                                : ''}
                                        </p>
                                    )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Banner inferior de ayuda */}
                <div
                    className="rounded-[18px] p-5 text-center text-white
                bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15
                border border-white/10"
                >
                    <p className="text-white/90 text-sm">
                        ¿Tienes dudas sobre tu cita?{' '}
                        <span className="font-semibold text-[#06B6D4]">
                            Contáctanos y te ayudamos.
                        </span>
                    </p>
                </div>
            </div>

            {/* Modal para nueva cita */}
            <AppointmentNewModal
                open={showNew}
                onClose={() => setShowNew(false)}
                onCreated={() => {
                    setShowNew(false);
                    // Aquí puedes volver a cargar las citas si lo necesitas
                    // loadAppointments();
                }}
            />
        </div>
    );

}
