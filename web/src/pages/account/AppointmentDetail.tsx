import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Appointment } from '../../types';
import { customerShowAppointment } from '../../services/customerAppointmentsApi';

export default function AppointmentDetail() {
    const { id } = useParams();
    const [a, setA] = useState<Appointment | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    useEffect(() => {
        (async () => {
            try { setA(await customerShowAppointment(Number(id))); }
            catch (e) { setMsg(e instanceof Error ? e.message : 'Error'); }
        })();
    }, [id]);

    if (msg) return <p className="p-4 text-red-300">{msg}</p>;
    if (!a) return <p className="p-4 text-white/70">Cargando…</p>;

    return (
        <div className="min-h-screen bg-[#07101B] text-white">
            <div className="max-w-3xl mx-auto p-4">
                <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Cita #{a.id} — {a.status.toUpperCase()}
                </h1>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p><strong>Servicio:</strong> {a.service_type}</p>
                    <p><strong>Consola:</strong> {a.console}</p>
                    <p><strong>Preferida:</strong> {new Date(a.preferred_at).toLocaleString()}</p>
                    {a.scheduled_at && <p><strong>Agendada:</strong> {new Date(a.scheduled_at).toLocaleString()}</p>}
                    {a.reschedule_proposed_at && <p><strong>Propuesta:</strong> {new Date(a.reschedule_proposed_at).toLocaleString()}</p>}
                    {a.reschedule_note && <p><strong>Nota:</strong> {a.reschedule_note}</p>}
                    {a.reject_reason && <p><strong>Motivo rechazo:</strong> {a.reject_reason}</p>}
                </div>
            </div>
        </div>
    );
}
