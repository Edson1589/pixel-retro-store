import { useEffect, useState } from 'react';
import { adminDeleteEvent, adminGetEvent } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

interface AdminEvent {
    id: number | string;
    title: string;
    slug?: string;
    type: EventKind;
    start_at?: string;
    end_at?: string | null;
    location?: string | null;
    description?: string | null;
    capacity?: number | null;
    status?: EventStatus;
    registration_open_at?: string | null;
    registration_close_at?: string | null;
    banner_url?: string | null;
}

export default function AdminEventDelete() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const [ev, setEv] = useState<AdminEvent | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const data = (await adminGetEvent(Number(id))) as AdminEvent;
            setEv(data);
        })();
    }, [id]);

    const doDelete = async (): Promise<void> => {
        if (!id) return;
        setBusy(true);
        try {
            await adminDeleteEvent(Number(id));
            nav('/admin/events');
        } finally {
            setBusy(false);
        }
    };

    if (!ev) return <p>Cargando...</p>;

    return (
        <div className="max-w-xl">
            <h2 className="text-lg font-bold mb-3">Eliminar evento</h2>
            <p>
                ¿Seguro que deseas eliminar <b>{ev.title}</b> (#{ev.id})? También se
                eliminarán sus registros.
            </p>
            <div className="flex gap-2 mt-4">
                <button
                    onClick={doDelete}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white"
                >
                    {busy ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <Link to={`/admin/events/${ev.id}`} className="px-4 py-2 rounded-xl border">
                    Cancelar
                </Link>
            </div>
        </div>
    );
}
