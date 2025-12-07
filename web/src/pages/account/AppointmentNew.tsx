import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    customerCreateAppointment,
    type CreateAppointmentPayload,
    type ServiceType,
    type AppointmentLocation,
} from '../../services/customerAppointmentsApi';

type Form = {
    service_type: ServiceType;
    console: string;
    problem_description: string;
    location: AppointmentLocation;
    address: string;
    contact_phone: string;
    preferred_at: string;
    duration_minutes: number;
    customer_notes: string;
};

function toIso(localValue: string): string {
    if (!localValue) return new Date().toISOString();
    const d = new Date(localValue);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export default function AppointmentNew() {
    const nav = useNavigate();
    const [form, setForm] = useState<Form>({
        service_type: 'repair',
        console: '',
        problem_description: '',
        location: 'shop',
        address: '',
        contact_phone: '',
        preferred_at: '',
        duration_minutes: 60,
        customer_notes: '',
    });

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const on =
        <K extends keyof Form>(k: K) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                const v = e.target.value;
                setForm(s => ({
                    ...s,
                    [k]: (k === 'duration_minutes' ? (v ? Number(v) : null) : v) as Form[K],
                }));
            };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setMsg(null);
        try {
            const payload: CreateAppointmentPayload = {
                service_type: form.service_type,
                console: form.console,
                problem_description: form.problem_description,
                location: form.location,
                ...(form.location === 'home' && form.address ? { address: form.address } : { address: null }),
                contact_phone: form.contact_phone,
                preferred_at: toIso(form.preferred_at),
                duration_minutes: form.duration_minutes ?? null,
                customer_notes: form.customer_notes || undefined,
            };

            await customerCreateAppointment(payload);
            nav('/account/appointments', { replace: true });
        } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Error al crear cita');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07101B] text-white">
            <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">Solicitar Cita</h1>

                <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm">Tipo de servicio</label>
                            <select className="w-full rounded-lg bg-white/10 border border-white/10 px-2 py-2"
                                value={form.service_type} onChange={on('service_type')}>
                                <option value="repair">Reparación</option>
                                <option value="maintenance">Mantenimiento</option>
                                <option value="diagnostic">Diagnóstico</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm">Consola</label>
                            <input className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                                placeholder="PS5, Xbox, Nintendo…" value={form.console} onChange={on('console')} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm">Descripción del problema</label>
                        <textarea rows={3} className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                            value={form.problem_description} onChange={on('problem_description')} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm">Lugar</label>
                            <select className="w-full rounded-lg bg-white/10 border border-white/10 px-2 py-2"
                                value={form.location} onChange={on('location')}>
                                <option value="shop">En taller</option>
                                <option value="home">A domicilio</option>
                            </select>
                        </div>
                        {form.location === 'home' && (
                            <div className="md:col-span-2">
                                <label className="text-sm">Dirección</label>
                                <input className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                                    value={form.address} onChange={on('address')} />
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm">Teléfono de contacto</label>
                            <input className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                                value={form.contact_phone} onChange={on('contact_phone')} />
                        </div>
                        <div>
                            <label className="text-sm">Fecha/hora preferida</label>
                            <input type="datetime-local"
                                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                                value={form.preferred_at}
                                onChange={on('preferred_at')} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm">Duración (min)</label>
                            <input type="number" min={30} max={240}
                                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                                value={form.duration_minutes}
                                onChange={e => setForm(s => ({ ...s, duration_minutes: Number(e.target.value) }))} />
                        </div>
                        <div>
                            <label className="text-sm">Notas</label>
                            <input className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                                value={form.customer_notes} onChange={on('customer_notes')} />
                        </div>
                    </div>

                    {msg && <p className="text-red-300">{msg}</p>}

                    <div className="flex gap-3">
                        <button disabled={busy}
                            className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 disabled:opacity-50">
                            {busy ? 'Enviando…' : 'Enviar solicitud'}
                        </button>
                        <button type="button" onClick={() => history.back()}
                            className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
