import { useEffect, useState } from 'react';
import type { Appointment, AppointmentStatus } from '../../../types';
import {
    adminListAppointments,
    adminAcceptAppointment,
    adminRejectAppointment,
    adminRescheduleAppointment,
    adminCompleteAppointment,
} from '../../../services/adminApi';

import FancySelect, { type Option } from '../../../components/FancySelect';
import {
    Users as UsersIcon,
    Filter,
    RefreshCw,
    CalendarClock,
    Gamepad2,
    Home,
    MapPin,
    Phone,
    Clock3,
    CheckCircle2,
    XCircle,
    Mail,
} from 'lucide-react';
import type { ReactNode } from 'react';

type OptStatus = '' | AppointmentStatus;

function StatusBadge({ status }: { status: Appointment['status'] }) {
    const map: Record<
        Appointment['status'],
        { cls: string; label: string; icon: ReactNode }
    > = {

        pending: {
            cls: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
            label: 'Pendiente',
            icon: <Clock3 className="h-3 w-3" />,
        },
        confirmed: {
            cls: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
            label: 'Confirmada',
            icon: <CheckCircle2 className="h-3 w-3" />,
        },
        rescheduled: {
            cls: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100',
            label: 'Reprogramada',
            icon: <Clock3 className="h-3 w-3" />,
        },
        completed: {
            cls: 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100',
            label: 'Completada',
            icon: <CheckCircle2 className="h-3 w-3" />,
        },
        rejected: {
            cls: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
            label: 'Rechazada',
            icon: <XCircle className="h-3 w-3" />,
        },
        cancelled: {
            cls: 'border-slate-400/40 bg-slate-500/15 text-slate-100',
            label: 'Cancelada',
            icon: <XCircle className="h-3 w-3" />,
        },
    };

    const m = map[status];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${m.cls}`}
        >
            {m.icon}
            <span>{m.label}</span>
        </span>
    );
}

function RowActions({ a, onChanged }: { a: Appointment; onChanged(): void }) {
    const [busy, setBusy] = useState(false);
    const [scheduleAt, setScheduleAt] = useState('');
    const [duration, setDuration] = useState(a.duration_minutes || 60);
    const [reason, setReason] = useState('');
    const [proposed, setProposed] = useState('');
    const [note, setNote] = useState('');

    const accept = async () => {
        if (!scheduleAt) return alert('Selecciona fecha/hora');
        try {
            setBusy(true);
            await adminAcceptAppointment(a.id, {
                scheduled_at: scheduleAt,
                duration_minutes: duration,
            });
            onChanged();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error');
        } finally {
            setBusy(false);
        }
    };

    const reject = async () => {
        if (!reason.trim()) return alert('Motivo requerido');
        try {
            setBusy(true);
            await adminRejectAppointment(a.id, reason);
            onChanged();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error');
        } finally {
            setBusy(false);
        }
    };

    const reschedule = async () => {
        if (!proposed) return alert('Nueva fecha/hora requerida');
        try {
            setBusy(true);
            await adminRescheduleAppointment(a.id, {
                proposed_at: proposed,
                note,
                duration_minutes: duration,
            });
            onChanged();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error');
        } finally {
            setBusy(false);
        }
    };

    const complete = async () => {
        try {
            setBusy(true);
            await adminCompleteAppointment(a.id);
            onChanged();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            {/* Agendar / Aceptar */}
            <td className="p-3 align-top">
                {a.status === 'pending' ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="datetime-local"
                            className="h-8 w-full md:w-auto md:min-w-[210px]
                   rounded-lg bg-white/[0.06] border border-white/10 px-2
                   text-xs text-white/90 placeholder:text-white/40
                   focus:outline-none focus:ring-2 focus:ring-[#06B6D488]"
                            value={scheduleAt}
                            onChange={(e) => setScheduleAt(e.target.value)}
                        />
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                min={30}
                                max={240}
                                className="h-8 w-16 rounded-lg bg-white/[0.06] border border-white/10 px-2
                     text-xs text-white/90
                     focus:outline-none focus:ring-2 focus:ring-[#06B6D488]"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            />
                            <span className="text-[11px] text-white/60">min</span>
                        </div>
                        <button
                            disabled={busy}
                            onClick={accept}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   text-[11px] border border-emerald-400/30 bg-emerald-500/10
                   hover:bg-emerald-500/15
                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Aceptar</span>
                        </button>
                    </div>
                ) : (
                    <span className="text-white/40 text-sm">—</span>
                )}
            </td>

            {/* Rechazar */}
            <td className="p-3 align-top">
                {a.status === 'pending' ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            placeholder="Motivo"
                            className="h-8 w-full md:w-auto md:min-w-[210px] flex-1
                   rounded-lg bg-white/[0.06] border border-white/10 px-2
                   text-xs text-white/90 placeholder:text-white/40
                   focus:outline-none focus:ring-2 focus:ring-[#06B6D488]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <button
                            disabled={busy}
                            onClick={reject}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   text-[11px] border border-rose-400/30 bg-rose-500/10
                   hover:bg-rose-500/15
                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Rechazar</span>
                        </button>
                    </div>
                ) : (
                    <span className="text-white/40 text-sm">—</span>
                )}
            </td>

            {/* Reprogramar */}
            <td className="p-3 align-top">
                {a.status === 'pending' ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="datetime-local"
                            className="h-8 w-full md:w-auto md:min-w-[210px]
                   rounded-lg bg-white/[0.06] border border-white/10 px-2
                   text-xs text-white/90 placeholder:text-white/40
                   focus:outline-none focus:ring-2 focus:ring-[#06B6D488]"
                            value={proposed}
                            onChange={(e) => setProposed(e.target.value)}
                        />
                        <input
                            placeholder="Nota"
                            className="h-8 w-full md:w-auto md:min-w-[210px] flex-1
                   rounded-lg bg-white/[0.06] border border-white/10 px-2
                   text-xs text-white/90 placeholder:text-white/40
                   focus:outline-none focus:ring-2 focus:ring-[#06B6D488]"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <button
                            disabled={busy}
                            onClick={reschedule}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   text-[11px] border border-amber-400/30 bg-amber-500/10
                   hover:bg-amber-500/15
                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Clock3 className="h-3.5 w-3.5" />
                            <span>Reprogramar</span>
                        </button>
                    </div>
                ) : (
                    <span className="text-white/40 text-sm">—</span>
                )}
            </td>

            {/* Completar */}
            <td className="p-3 align-top text-center">
                {a.status === 'confirmed' ? (
                    <button
                        disabled={busy}
                        onClick={complete}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                 text-[11px] border border-indigo-400/30 bg-indigo-500/10
                 hover:bg-indigo-500/15
                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Marcar completada</span>
                    </button>
                ) : (
                    <span className="text-white/40 text-sm">—</span>
                )}
            </td>

        </>
    );
}

export default function AdminAppointmentsList() {
    const [items, setItems] = useState<Appointment[]>([]);
    const [status, setStatus] = useState<OptStatus>(''); // '' = todos
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setMsg(null);
        try {
            const r = await adminListAppointments({
                status: status || undefined,
                per_page: 100,
            });
            setItems(r.data);
        } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Error cargando');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [status]);

    // Opciones para el FancySelect
    const statusOptions: Option[] = [
        { label: 'Todos', value: '' },
        { label: 'Pendientes', value: 'pending' },
        { label: 'Reprogramación', value: 'rescheduled' },
        { label: 'Confirmadas', value: 'confirmed' },
        { label: 'Completadas', value: 'completed' },
        { label: 'Rechazadas', value: 'rejected' },
        { label: 'Canceladas', value: 'cancelled' },
    ];

    // Mini-resumen basado en los ítems cargados (vista actual)
    const total = items.length;
    const pendingCount = items.filter((a) => a.status === 'pending').length;
    const confirmedCount = items.filter((a) => a.status === 'confirmed').length;
    const completedCount = items.filter((a) => a.status === 'completed').length;

    return (
        <div className="text-white space-y-5">
            {/* HEADER + FILTRO */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                    >
                        <CalendarClock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                           bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                            Citas
                        </h2>
                        <p className="text-xs text-white/60">
                            Gestiona solicitudes, reprogramaciones y estados de servicio técnico.
                        </p>
                    </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-white/70">
                        <Filter className="h-4 w-4" />
                        <span>Estado:</span>
                    </div>
                    <FancySelect
                        className="min-w-[200px]"
                        value={status}
                        onChange={(v) => setStatus(v as OptStatus)}
                        options={statusOptions}
                        placeholder="Todos"
                    />
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                       border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* RESUMEN RÁPIDO (vista actual) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Total (vista)
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {total}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                        <Clock3 className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Pendientes
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {pendingCount}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Confirmadas
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {confirmedCount}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Completadas
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                            {completedCount}
                        </div>
                    </div>
                </div>
            </section>

            {/* MENSAJE DE ERROR */}
            {msg && <p className="text-sm text-rose-300">{msg}</p>}

            {/* TABLA */}
            {loading ? (
                <p className="text-white/70 text-sm">Cargando…</p>
            ) : (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                    <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] text-white/70">
                            <tr>
                                <th className="p-3 text-left font-semibold w-[30%]">Cita</th>
                                <th className="p-3 text-left font-semibold">Agendar / Aceptar</th>
                                <th className="p-3 text-left font-semibold">Rechazar</th>
                                <th className="p-3 text-left font-semibold">Reprogramar</th>
                                <th className="p-3 text-center font-semibold">Completar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {items.map((a) => (
                                <tr key={a.id} className="align-top hover:bg-white/[0.035] transition-colors">
                                    {/* Detalles */}
                                    <td className="p-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-semibold text-white/90 flex flex-wrap items-center gap-2">
                                                <span>
                                                    #{a.id} • {a.service_type.toUpperCase()} • {a.console}
                                                </span>
                                                <StatusBadge status={a.status} />
                                            </div>

                                            <div className="text-xs text-white/70 flex flex-wrap items-center gap-2">
                                                <Gamepad2 className="h-3.5 w-3.5 opacity-80" />
                                                <span>
                                                    Cliente:{' '}
                                                    <span className="text-white/85">
                                                        {a.customer?.name ?? a.customer_id}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="text-xs text-white/70 space-y-0.5">
                                                {/* Preferida */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <CalendarClock className="h-3.5 w-3.5 opacity-80" />
                                                    <span>
                                                        Preferida:{' '}
                                                        <span className="text-white/85">
                                                            {new Date(a.preferred_at).toLocaleString()}
                                                        </span>
                                                    </span>
                                                </div>

                                                {/* Agendada (solo si existe) */}
                                                {a.scheduled_at && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <CalendarClock className="h-3.5 w-3.5 opacity-80" />
                                                        <span>
                                                            Agendada:{' '}
                                                            <span className="text-emerald-200">
                                                                {new Date(a.scheduled_at).toLocaleString()}
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>


                                            {a.location === 'home' && (
                                                <div className="text-xs text-white/70 flex flex-wrap items-center gap-2">
                                                    <Home className="h-3.5 w-3.5 opacity-80" />
                                                    <span>
                                                        Domicilio:{' '}
                                                        <span className="text-white/85">{a.address}</span>
                                                    </span>
                                                </div>
                                            )}

                                            {a.location === 'shop' && (
                                                <div className="text-xs text-white/70 flex flex-wrap items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 opacity-80" />
                                                    <span>Tienda física</span>
                                                </div>
                                            )}

                                            {a.contact_phone && (
                                                <div className="text-xs text-white/70 flex flex-wrap items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 opacity-80" />
                                                    <span>{a.contact_phone}</span>
                                                </div>
                                            )}

                                            {a.customer?.email && (
                                                <div className="text-xs text-white/70 flex flex-wrap items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 opacity-80" />
                                                    <span>{a.customer?.email}</span>
                                                </div>
                                            )}

                                            {a.reschedule_proposed_at && (
                                                <div className="text-xs text-white/70">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock3 className="h-3.5 w-3.5 opacity-80" />
                                                        <span>
                                                            Propuesta:{' '}
                                                            <span className="text-white/85">
                                                                {new Date(
                                                                    a.reschedule_proposed_at
                                                                ).toLocaleString()}
                                                            </span>
                                                            {a.reschedule_note
                                                                ? ` — ${a.reschedule_note}`
                                                                : ''}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Acciones en columnas */}
                                    <RowActions a={a} onChanged={load} />
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td
                                        className="py-6 text-center text-white/70"
                                        colSpan={5}
                                    >
                                        Sin resultados en este estado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

