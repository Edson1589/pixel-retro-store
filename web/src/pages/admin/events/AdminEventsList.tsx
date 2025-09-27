import { useEffect, useState } from 'react';
import { adminListEvents } from '../../../services/adminApi';
import { Link } from 'react-router-dom';

type EventKind = 'event' | 'tournament';
type EventStatus = 'draft' | 'published' | 'archived';

interface AdminEvent {
    id: number | string;
    title: string;
    type: EventKind;
    start_at: string;
    status: EventStatus;
}

interface AdminEventsResponse {
    data: AdminEvent[];
}

export default function AdminEventsList() {
    const [data, setData] = useState<AdminEventsResponse>({ data: [] });
    const [loading, setLoading] = useState(true);

    const load = async (): Promise<void> => {
        setLoading(true);
        try {
            const res = (await adminListEvents()) as AdminEventsResponse;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    return (
        <div>
            <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold">Eventos</h2>
                <Link to="/admin/events/new" className="ml-auto px-3 py-2 rounded-xl bg-black text-white">
                    Nuevo
                </Link>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Título</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Inicio</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((ev) => (
                            <tr key={ev.id} className="border-t">
                                <td className="p-2">{ev.title}</td>
                                <td className="p-2 text-center">{ev.type}</td>
                                <td className="p-2 text-center">{new Date(ev.start_at).toLocaleString()}</td>
                                <td className="p-2 text-center">{ev.status}</td>
                                <td className="p-2 text-center">
                                    <Link className="underline mr-2" to={`/admin/events/${ev.id}`}>
                                        Ver
                                    </Link>
                                    <Link className="underline mr-2" to={`/admin/events/${ev.id}/edit`}>
                                        Editar
                                    </Link>
                                    <Link className="underline mr-2" to={`/admin/events/${ev.id}/registrations`}>
                                        Registros
                                    </Link>
                                    <Link className="underline" to={`/admin/events/${ev.id}/delete`}>
                                        Eliminar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {data.data.length === 0 && (
                            <tr>
                                <td className="p-3 text-center text-gray-500" colSpan={5}>
                                    No hay eventos todavía.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
