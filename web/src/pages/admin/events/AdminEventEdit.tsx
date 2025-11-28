import { useEffect, useState } from 'react';
import { adminGetEvent, adminUpdateEvent } from '../../../services/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
import EventForm from './EventForm';

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

interface AdminEvent {
    id: number | string;
    title: string;
    slug: string;
    type: EventKind;
    start_at: string;
    end_at?: string | null;
    location?: string | null;
    description?: string | null;
    capacity?: number | null;
    status: EventStatus;
    registration_open_at?: string | null;
    registration_close_at?: string | null;
    banner_url?: string | null;
}

export default function AdminEventEdit() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const [ev, setEv] = useState<AdminEvent | null>(null);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const data = (await adminGetEvent(Number(id))) as AdminEvent;
            setEv(data);
        })();
    }, [id]);

    const submit = async (fd: FormData) => {
        if (!id) return;
        const saved = (await adminUpdateEvent(Number(id), fd)) as AdminEvent;
        nav(`/admin/events/${saved.id}`);
    };

    if (!ev) return <p>Cargando...</p>;

    return (
        <EventForm initial={ev} onSubmit={submit} submitLabel="Guardar cambios" />
    );
}
