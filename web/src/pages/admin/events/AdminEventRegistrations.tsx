import { useEffect, useState } from 'react';
import { adminGetEvent, adminListEventRegs, adminUpdateRegStatus } from '../../../services/adminApi';
import { useParams } from 'react-router-dom';

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

interface AdminEvent {
    id: number | string;
    title: string;
    type: EventKind;
    start_at: string;
    end_at?: string | null;
    location?: string | null;
    status: EventStatus;
    capacity?: number | null;
    registrations_count?: number;
    description?: string | null;
    banner_url?: string | null;
}

type RegStatus = 'pending' | 'confirmed' | 'cancelled';
type StatusFilter = 'all' | RegStatus;

interface Registration {
    id: number | string;
    name: string;
    email: string;
    gamer_tag?: string | null;
    team?: string | null;
    status: RegStatus;
}

interface RegistrationsResponse {
    data: Registration[];
}

export default function AdminEventRegistrations() {
    const { id } = useParams<{ id: string }>();
    const [ev, setEv] = useState<AdminEvent | null>(null);
    const [data, setData] = useState<RegistrationsResponse>({ data: [] });
    const [status, setStatus] = useState<StatusFilter>('all');

    const load = async (): Promise<void> => {
        if (!id) return;
        const eventData = (await adminGetEvent(Number(id))) as AdminEvent;
        const regs = (await adminListEventRegs(
            Number(id),
            status === 'all' ? undefined : status
        )) as RegistrationsResponse;
        setEv(eventData);
        setData(regs);
    };

    useEffect(() => { void load(); }, [id, status]);

    const change = async (regId: number | string, st: RegStatus): Promise<void> => {
        if (!id) return;
        await adminUpdateRegStatus(Number(id), Number(regId), st);
        await load();
    };

    if (!ev) return <p>Cargando...</p>;

    return (
        <div>
            <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold">Registros · {ev.title}</h2>
                <select
                    className="ml-auto border rounded-xl px-3 py-2"
                    value={status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setStatus(e.target.value as StatusFilter)
                    }
                >
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="cancelled">Cancelados</option>
                </select>
            </div>

            <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Gamer Tag</th>
                        <th className="p-2">Equipo</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.data.map((r) => (
                        <tr key={r.id} className="border-t">
                            <td className="p-2">{r.name}</td>
                            <td className="p-2 text-center">{r.email}</td>
                            <td className="p-2 text-center">{r.gamer_tag || '—'}</td>
                            <td className="p-2 text-center">{r.team || '—'}</td>
                            <td className="p-2 text-center">{r.status}</td>
                            <td className="p-2 text-center space-x-2">
                                <button className="underline" onClick={() => change(r.id, 'confirmed')}>
                                    Confirmar
                                </button>
                                <button className="underline" onClick={() => change(r.id, 'pending')}>
                                    Pendiente
                                </button>
                                <button className="underline" onClick={() => change(r.id, 'cancelled')}>
                                    Cancelar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {data.data.length === 0 && (
                        <tr>
                            <td className="p-3 text-center text-gray-500" colSpan={6}>
                                No hay registros para este filtro.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
