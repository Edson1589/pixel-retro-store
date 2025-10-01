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

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });

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

    if (!ev) return <p className="text-white/70">Cargando…</p>;

    const typePill =
        ev.type === 'event'
            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-cyan-400/25 text-cyan-300 bg-cyan-500/15'
            : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-violet-400/25 text-violet-300 bg-violet-500/15';

    const statusPill =
        ev.status === 'published'
            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-emerald-400/25 text-emerald-300 bg-emerald-500/15'
            : ev.status === 'draft'
                ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/15 text-white/75 bg-white/10'
                : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-rose-400/25 text-rose-300 bg-rose-500/15';

    return (
        <div className="space-y-5 text-white">
            {/* Header */}
            <div className="flex items-center gap-3">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                >
                    Evento · #{ev.id}
                </h2>

                <div className="ml-auto flex gap-2">
                    <Link
                        to={`/admin/events/${ev.id}/edit`}
                        className="px-3 py-2 rounded-xl text-sm text-white bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                       hover:brightness-110 shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]"
                    >
                        Editar
                    </Link>
                    <Link
                        to={`/admin/events/${ev.id}/registrations`}
                        className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Registros
                    </Link>
                    <Link
                        to={`/admin/events/${ev.id}/delete`}
                        className="px-3 py-2 rounded-xl text-sm border border-rose-400/30 text-rose-200 bg-rose-500/10 hover:bg-rose-500/15"
                    >
                        Eliminar
                    </Link>
                    <Link
                        to="/admin/events"
                        className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            {/* Banner + meta */}
            <div className="grid md:grid-cols-3 gap-5">
                <div
                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] p-3
                     shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
                >
                    <div className="aspect-[16/9] rounded-xl bg-white/[0.03] border border-white/10 grid place-items-center overflow-hidden">
                        {ev.banner_url ? (
                            <img src={ev.banner_url} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm text-white/50">Sin banner</span>
                        )}
                    </div>

                    {/* Fecha destacada */}
                    <div className="mt-4 text-center">
                        <div className="text-xs uppercase tracking-widest text-white/60">Inicio</div>
                        <div className="text-lg font-semibold text-[#06B6D4]">{fmtDateTime(ev.start_at)}</div>
                        {ev.end_at && (
                            <>
                                <div className="mt-1 text-xs uppercase tracking-widest text-white/60">Fin</div>
                                <div className="text-sm text-white/80">{fmtDateTime(ev.end_at)}</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Detalles */}
                <div
                    className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5
                     shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-5"
                >
                    {/* Título + chips */}
                    <div>
                        <div className="text-lg font-semibold">{ev.title}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={typePill}>{ev.type === 'event' ? 'Evento' : 'Torneo'}</span>
                            <span className={statusPill}>
                                {ev.status === 'published' ? 'Publicado' : ev.status === 'draft' ? 'Borrador' : 'Archivado'}
                            </span>
                            {ev.location && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/15 bg-white/10 text-white/80">
                                    {ev.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Métricas cortas */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs text-white/60">Cupo</div>
                            <div className="mt-0.5 text-white/90">{ev.capacity ?? 'Ilimitado'}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xs text-white/60">Registros</div>
                            <div className="mt-0.5 text-white/90">{ev.registrations_count ?? 0}</div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/60 mb-1">Descripción</div>
                        <p className="text-white/80 whitespace-pre-wrap">{ev.description || '—'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
