import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Appointment } from '../../types';
import { customerListAppointments, customerCancelAppointment, customerConfirmReschedule } from '../../services/customerAppointmentsApi';

const STATUS_FILTERS = [
    'all', 'pending', 'confirmed', 'rescheduled', 'completed', 'rejected', 'cancelled',
] as const;
type AppointmentStatusFilter = typeof STATUS_FILTERS[number];

export default function AccountAppointments() {
    const [items, setItems] = useState<Appointment[]>([]);
    const [status, setStatus] = useState<AppointmentStatusFilter>('all');
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);

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

    const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.currentTarget.value;
        if (STATUS_FILTERS.includes(v as AppointmentStatusFilter)) {
            setStatus(v as AppointmentStatusFilter);
        }
    };

    return (
        <div className="min-h-screen bg-[#07101B] text-white">
            <div className="max-w-5xl mx-auto p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">Mis Citas</h1>
                    <Link to="/account/appointments/new" className="px-3 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110">Solicitar cita</Link>
                </div>

                <div className="mt-4">
                    <label className="text-sm mr-2">Estado:</label>
                    <select
                        value={status}
                        onChange={onStatusChange}
                        className="bg-white/10 border border-white/10 rounded-lg px-2 py-1"
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="rescheduled">Reprogramación</option>
                        <option value="completed">Completada</option>
                        <option value="rejected">Rechazada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                </div>

                {msg && <p className="mt-3 text-red-300">{msg}</p>}
                {loading ? <p className="mt-6 opacity-70">Cargando…</p> : (
                    <div className="mt-4 grid gap-3">
                        {items.length === 0 && <p className="opacity-70">No tienes citas.</p>}
                        {items.map(a => (
                            <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <div className="font-semibold">{a.service_type.toUpperCase()} • {a.console}</div>
                                        <div className="text-sm opacity-80">
                                            Preferida: {new Date(a.preferred_at).toLocaleString()} {a.scheduled_at ? ` • Agendada: ${new Date(a.scheduled_at).toLocaleString()}` : ''}
                                        </div>
                                        <div className="text-xs mt-1 opacity-70">Estado: <span className="uppercase">{a.status}</span></div>
                                    </div>
                                    <div className="flex gap-2">
                                        {a.status === 'confirmed' && (
                                            <button onClick={() => cancel(a.id)} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">Cancelar</button>
                                        )}
                                        {a.status === 'rescheduled' && (
                                            <>
                                                <button onClick={() => acceptResched(a.id, true)} className="px-3 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600">Aceptar</button>
                                                <button onClick={() => acceptResched(a.id, false)} className="px-3 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-600">Rechazar</button>
                                            </>
                                        )}
                                        <Link to={`/account/appointments/${a.id}`} className="px-3 py-1 rounded-lg bg-[#7C3AED]/80 hover:bg-[#7C3AED]">Ver</Link>
                                    </div>
                                </div>
                                {a.status === 'rescheduled' && a.reschedule_proposed_at && (
                                    <p className="text-sm mt-2 opacity-90">
                                        Nueva propuesta: <strong>{new Date(a.reschedule_proposed_at).toLocaleString()}</strong>
                                        {a.reschedule_note ? ` — ${a.reschedule_note}` : ''}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
