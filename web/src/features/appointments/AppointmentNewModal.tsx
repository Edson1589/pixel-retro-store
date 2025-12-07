import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import FancySelect from '../../components/FancySelect';
import {
    customerCreateAppointment,
    type CreateAppointmentPayload,
    type ServiceType,
    type AppointmentLocation,
} from '../../services/customerAppointmentsApi';

import {
    Gamepad2,
    Wrench,
    AlertCircle,
    CalendarClock,
    Phone,
    MapPin,
    Clock3,
    StickyNote,
    Home,
    Building2,
    Send,
    X,
} from 'lucide-react';

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

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

const initialForm: Form = {
    service_type: 'repair',
    console: '',
    problem_description: '',
    location: 'shop',
    address: '',
    contact_phone: '',
    preferred_at: '',
    duration_minutes: 60,
    customer_notes: '',
};

function toIso(localValue: string): string {
    if (!localValue) return new Date().toISOString();
    const d = new Date(localValue);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export default function AppointmentNewModal({ open, onClose, onCreated }: Props) {
    const [form, setForm] = useState<Form>(initialForm);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(initialForm);
            setMsg(null);
            setBusy(false);
        }
    }, [open]);

    const on =
        <K extends keyof Form>(k: K) =>
            (
                e:
                    | React.ChangeEvent<HTMLInputElement>
                    | React.ChangeEvent<HTMLTextAreaElement>
            ) => {
                const v = e.target.value;
                setForm((s) => ({
                    ...s,
                    [k]: (k === 'duration_minutes' ? Number(v || 0) : v) as Form[K],
                }));
            };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        try {
            const payload: CreateAppointmentPayload = {
                service_type: form.service_type,
                console: form.console,
                problem_description: form.problem_description,
                location: form.location,
                ...(form.location === 'home' && form.address
                    ? { address: form.address }
                    : { address: null }),
                contact_phone: form.contact_phone,
                preferred_at: toIso(form.preferred_at),
                duration_minutes: form.duration_minutes ?? null,
                customer_notes: form.customer_notes || undefined,
            };

            await customerCreateAppointment(payload);
            onCreated?.();
            onClose();
        } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Error al crear cita');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Solicitar cita"
            maxWidthClass="max-w-2xl"
        >
            <form onSubmit={submit} className="grid gap-3">
                <div className="grid md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            <span>Tipo de servicio</span>
                        </label>
                        <FancySelect
                            value={form.service_type}
                            onChange={(v) =>
                                setForm((s) => ({
                                    ...s,
                                    service_type: v as ServiceType,
                                }))
                            }
                            options={[
                                { value: 'repair', label: 'Reparación' },
                                { value: 'maintenance', label: 'Mantenimiento' },
                                { value: 'diagnostic', label: 'Diagnóstico' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Gamepad2 className="h-3 w-3" />
                            <span>Consola</span>
                        </label>
                        <div className="relative">
                            <Gamepad2 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                className="w-full rounded-xl pl-9 pr-3 py-2
                                bg-white/[0.05] text-white/90 border border-white/10
                                focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="PS5, Xbox, Nintendo…"
                                value={form.console}
                                onChange={on('console')}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Descripción del problema</span>
                    </label>
                    <textarea
                        rows={3}
                        className="w-full rounded-xl px-3 py-2
                        bg-white/[0.05] text-white/90 border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        value={form.problem_description}
                        onChange={on('problem_description')}
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>Lugar</span>
                        </label>
                        <FancySelect
                            value={form.location}
                            onChange={(v) =>
                                setForm((s) => ({
                                    ...s,
                                    location: v as AppointmentLocation,
                                }))
                            }
                            options={[
                                { value: 'shop', label: 'En taller' },
                                { value: 'home', label: 'A domicilio' },
                            ]}
                        />
                    </div>

                    {form.location === 'home' && (
                        <div className="md:col-span-2">
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                <span>Dirección</span>
                            </label>
                            <div className="relative">
                                <Building2 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    className="w-full rounded-xl pl-9 pr-3 py-2
                                    bg-white/[0.05] text-white/90 border border-white/10
                                    focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    value={form.address}
                                    onChange={on('address')}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>Teléfono de contacto</span>
                        </label>
                        <div className="relative">
                            <Phone className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                className="w-full rounded-xl pl-9 pr-3 py-2
                                bg-white/[0.05] text-white/90 border border-white/10
                                focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                value={form.contact_phone}
                                onChange={on('contact_phone')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            <span>Fecha/hora preferida</span>
                        </label>
                        <div className="relative">
                            <CalendarClock className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="datetime-local"
                                className="w-full rounded-xl pl-9 pr-3 py-2
                                bg-white/[0.05] text-white/90 border border-white/10
                                focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                value={form.preferred_at}
                                onChange={on('preferred_at')}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            <span>Duración (min)</span>
                        </label>
                        <input
                            type="number"
                            min={30}
                            max={240}
                            className="w-full rounded-xl px-3 py-2
                            bg-white/[0.05] text-white/90 border border-white/10
                            focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            value={form.duration_minutes}
                            onChange={(e) =>
                                setForm((s) => ({
                                    ...s,
                                    duration_minutes: Number(e.target.value || 0),
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                            <StickyNote className="h-3 w-3" />
                            <span>Notas</span>
                        </label>
                        <input
                            className="w-full rounded-xl px-3 py-2
                            bg-white/[0.05] text-white/90 border border-white/10
                            focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            value={form.customer_notes}
                            onChange={on('customer_notes')}
                        />
                    </div>
                </div>

                {msg && (
                    <p className="text-sm text-red-300 mt-1 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        <span>{msg}</span>
                    </p>
                )}

                <div className="mt-3 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                        bg-white/10 border border-white/10 hover:bg-white/15 text-sm"
                    >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                        text-sm font-medium hover:brightness-110 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        <span>{busy ? 'Enviando…' : 'Enviar solicitud'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
