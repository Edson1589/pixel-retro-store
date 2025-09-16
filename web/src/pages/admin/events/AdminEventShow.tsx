import { useEffect, useState } from 'react';
import { adminGetEvent } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';

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

export default function AdminEventShow() {
    const { id } = useParams<{ id: string }>();
    const [ev, setEv] = useState<AdminEvent | null>(null);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const data = (await adminGetEvent(Number(id))) as AdminEvent;
            setEv(data);
        })();
    }, [id]);

    if (!ev) return <p>Cargando...</p>;

    return (
        <div className="space-y-3">
            <div className="flex items-center">
                <h2 className="text-lg font-bold">Evento · #{ev.id}</h2>
                <div className="ml-auto flex gap-2">
                    <Link to={`/admin/events/${ev.id}/edit`} className="px-3 py-2 rounded-xl border">Editar</Link>
                    <Link to={`/admin/events/${ev.id}/registrations`} className="px-3 py-2 rounded-xl border">Registros</Link>
                    <Link to={`/admin/events/${ev.id}/delete`} className="px-3 py-2 rounded-xl border">Eliminar</Link>
                    <Link to="/admin/events" className="px-3 py-2 rounded-xl border">Volver</Link>
                </div>
            </div>

            {ev.banner_url && (
                <img src={ev.banner_url} alt={ev.title} className="max-h-60 rounded-xl border" />
            )}

            <div><span className="text-gray-500">Título:</span> <b>{ev.title}</b></div>
            <div><span className="text-gray-500">Tipo:</span> {ev.type}</div>
            <div>
                <span className="text-gray-500">Fecha:</span>{' '}
                {new Date(ev.start_at).toLocaleString()}{' '}
                {ev.end_at && `— ${new Date(ev.end_at).toLocaleString()}`}
            </div>
            <div><span className="text-gray-500">Lugar:</span> {ev.location || '—'}</div>
            <div><span className="text-gray-500">Estado:</span> {ev.status}</div>
            <div><span className="text-gray-500">Cupo:</span> {ev.capacity ?? 'Ilimitado'}</div>
            <div><span className="text-gray-500">Registros:</span> {ev.registrations_count ?? 0}</div>
            <div className="text-gray-500">Descripción:</div>
            <p>{ev.description || '—'}</p>
        </div>
    );
}
