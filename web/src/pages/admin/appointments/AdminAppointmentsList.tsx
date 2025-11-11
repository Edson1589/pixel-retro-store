import { useEffect, useState } from 'react';
import type { Appointment, AppointmentStatus } from '../../../types';
import {
    adminListAppointments,
    adminAcceptAppointment,
    adminRejectAppointment,
    adminRescheduleAppointment,
    adminCompleteAppointment,
} from '../../../services/adminApi';

type OptStatus = '' | AppointmentStatus;

function StatusBadge({ status }: { status: Appointment['status'] }) {
    const map: Record<Appointment['status'], string> = {
        pending: 'bg-amber-400 text-[#07101B]',
        confirmed: 'bg-emerald-400 text-[#07101B]',
        rescheduled: 'bg-cyan-300 text-[#07101B]',
        completed: 'bg-indigo-400 text-white',
        rejected: 'bg-rose-400 text-white',
        cancelled: 'bg-slate-400 text-white',
    };
    return (
        <span className={`ml-2 inline-flex items-center justify-center px-2 h-5 rounded-full text-[11px] font-semibold ${map[status]}`}>
            {status}
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
            await adminAcceptAppointment(a.id, { scheduled_at: scheduleAt, duration_minutes: duration });
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
            await adminRescheduleAppointment(a.id, { proposed_at: proposed, note, duration_minutes: duration });
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
            {/* Aceptar */}
            <td className="p-3 align-top">
                {a.status === 'pending' ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="datetime-local"
                            className="h-9 bg-white/10 border border-white/10 rounded-xl px-2
               w-full md:w-auto md:min-w-[220px]"
                            value={scheduleAt}
                            onChange={(e) => setScheduleAt(e.target.value)}
                        />
                        <input
                            type="number"
                            min={30}
                            max={240}
                            className="h-9 bg-white/10 border border-white/10 rounded-xl px-2 w-24"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        />
                        <button
                            disabled={busy}
                            onClick={accept}
                            className="h-9 px-3 rounded-xl bg-emerald-600/85 hover:bg-emerald-600 disabled:opacity-50"
                        >
                            Aceptar
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
                            className="h-9 bg-white/10 border border-white/10 rounded-xl px-2
               w-full md:w-auto md:min-w-[220px] flex-1"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <button
                            disabled={busy}
                            onClick={reject}
                            className="h-9 px-3 rounded-xl bg-rose-600/85 hover:bg-rose-600 disabled:opacity-50"
                        >
                            Rechazar
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
                            className="h-9 bg-white/10 border border-white/10 rounded-xl px-2
               w-full md:w-auto md:min-w-[220px]"
                            value={proposed}
                            onChange={(e) => setProposed(e.target.value)}
                        />
                        <input
                            placeholder="Nota"
                            className="h-9 bg-white/10 border border-white/10 rounded-xl px-2
               w-full md:w-auto md:min-w-[220px] flex-1"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <button
                            disabled={busy}
                            onClick={reschedule}
                            className="h-9 px-3 rounded-xl bg-amber-600/85 hover:bg-amber-600 disabled:opacity-50"
                        >
                            Reprogramar
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
                        className="h-9 px-3 rounded-xl bg-indigo-600/85 hover:bg-indigo-600 disabled:opacity-50"
                    >
                        Marcar completada
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

    useEffect(() => { load(); }, [status]);

    return (
        <div className="text-white space-y-4">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                Citas
            </h1>

            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-white/80">Estado:</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OptStatus)}
                    className="h-9 w-56 rounded-xl px-3 bg-white/[0.06] text-white/90 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                >
                    <option value="">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="rescheduled">Reprogramación</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="completed">Completadas</option>
                    <option value="rejected">Rechazadas</option>
                    <option value="cancelled">Canceladas</option>
                </select>
            </div>

            {msg && <p className="text-rose-300">{msg}</p>}

            {loading ? (
                <p className="text-white/70">Cargando…</p>
            ) : (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                    <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] text-white/70">
                            <tr>
                                <th className="p-3 text-left font-semibold w-[30%]">Detalles</th>
                                <th className="p-3 text-left font-semibold">Agendar / Aceptar</th>
                                <th className="p-3 text-left font-semibold">Rechazar</th>
                                <th className="p-3 text-left font-semibold">Reprogramar</th>
                                <th className="p-3 text-center font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {items.map((a) => (
                                <tr key={a.id} className="align-top hover:bg-white/[0.035]">
                                    {/* Detalles */}
                                    <td className="p-3">
                                        <div className="font-semibold">
                                            #{a.id} • {a.service_type.toUpperCase()} • {a.console}
                                            <StatusBadge status={a.status} />
                                        </div>
                                        <div className="text-sm opacity-80 mt-1">
                                            Cliente: {a.customer?.name ?? a.customer_id} —{' '}
                                            {new Date(a.preferred_at).toLocaleString()}
                                            {a.scheduled_at && (
                                                <> • Agendada: {new Date(a.scheduled_at).toLocaleString()}</>
                                            )}
                                        </div>
                                        {a.location === 'home' && (
                                            <div className="text-xs opacity-80 mt-1">Domicilio: {a.address}</div>
                                        )}
                                        {a.reschedule_proposed_at && (
                                            <div className="text-xs opacity-80 mt-1">
                                                Propuesta: {new Date(a.reschedule_proposed_at).toLocaleString()}
                                                {a.reschedule_note ? ` — ${a.reschedule_note}` : ''}
                                            </div>
                                        )}
                                    </td>

                                    {/* Acciones en columnas */}
                                    <RowActions a={a} onChanged={load} />
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td className="py-6 text-center text-white/70" colSpan={5}>
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
