import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import { Link } from 'react-router-dom';

type EventKind = 'event' | 'tournament';
type TypeFilter = 'all' | EventKind;

interface StoreEvent {
    id: number | string;
    slug: string;
    title: string;
    type: EventKind;
    start_at: string;
    banner_url?: string | null;
}

interface EventsListResponse {
    data: StoreEvent[];
}

export default function EventsList() {
    const [data, setData] = useState<EventsListResponse>({ data: [] });
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [type, setType] = useState<TypeFilter>('all');

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchEvents({
                search: q || undefined,
                type: type === 'all' ? undefined : type,
                upcoming: true,
                per_page: 24,
            }) as EventsListResponse;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                <h1 className="text-2xl font-bold">Eventos & Torneos</h1>
                <div className="ml-auto flex gap-2">
                    <select
                        className="border rounded-xl px-3 py-2"
                        value={type}
                        onChange={(ev: React.ChangeEvent<HTMLSelectElement>) =>
                            setType(ev.target.value as TypeFilter)
                        }
                    >
                        <option value="all">Todos</option>
                        <option value="event">Eventos</option>
                        <option value="tournament">Torneos</option>
                    </select>
                    <input
                        className="border rounded-xl px-3 py-2"
                        placeholder="Buscar..."
                        value={q}
                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setQ(ev.target.value)}
                    />
                    <button className="border rounded-xl px-3 py-2" onClick={load}>
                        Filtrar
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.data.map((item) => (
                        <Link
                            to={`/events/${item.slug}`}
                            key={item.id}
                            className="border rounded-2xl overflow-hidden hover:shadow-sm"
                        >
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                {item.banner_url ? (
                                    <img
                                        src={item.banner_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm text-gray-500">Sin banner</span>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="text-xs uppercase tracking-wide text-gray-500">
                                    {item.type === 'tournament' ? 'Torneo' : 'Evento'}
                                </div>
                                <div className="font-semibold">{item.title}</div>
                                <div className="text-sm text-gray-500">
                                    {new Date(item.start_at).toLocaleString()}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
