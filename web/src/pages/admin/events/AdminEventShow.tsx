import { useEffect, useState } from 'react';
import { adminGetEvent } from '../../../services/adminApi';
import { Link, useParams } from 'react-router-dom';
import {
    CalendarRange,
    CalendarClock,
    MapPin,
    Users,
    Ticket,
    AlignLeft,
    Edit3,
    ListChecks,
    Trash2,
    ArrowLeft,
} from 'lucide-react';

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
        <div className="flex justify-center">
            <div className="w-full max-w-3xl text-white space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                           bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                           shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                           flex items-center justify-center"
                        >
                            <CalendarRange className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2
                                className="text-xl font-extrabold bg-clip-text text-transparent
                               bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                            >
                                Evento · #{ev.id}
                            </h2>
                            <p className="text-xs text-white/60">
                                Resumen del evento y accesos rápidos a sus acciones.
                            </p>
                        </div>
                    </div>

                    <div className="ml-auto flex flex-wrap gap-2">
                        <Link
                            to={`/admin/events/${ev.id}/edit`}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                           text-sm font-medium
                           shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                           hover:brightness-110"
                        >
                            <Edit3 className="h-4 w-4" />
                            <span>Editar</span>
                        </Link>

                        <Link
                            to={`/admin/events/${ev.id}/registrations`}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                           border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]
                           text-sm"
                        >
                            <ListChecks className="h-4 w-4" />
                            <span>Registros</span>
                        </Link>

                        <Link
                            to={`/admin/events/${ev.id}/delete`}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                           border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/15
                           text-sm text-rose-100"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                        </Link>

                        <Link
                            to="/admin/events"
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                           border border-white/10 bg-white/[0.06] hover:bg-white/10
                           text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver</span>
                        </Link>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div className="grid md:grid-cols-3 gap-5">
                    {/* Banner + fechas */}
                    <div
                        className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] p-3
                       shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
                    >
                        <div className="aspect-[16/9] rounded-xl bg-white/[0.03] border border-white/10 grid place-items-center overflow-hidden">
                            {ev.banner_url ? (
                                <img
                                    src={ev.banner_url}
                                    alt={ev.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm text-white/50">Sin banner</span>
                            )}
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/60">
                                    <CalendarClock className="h-3 w-3" />
                                    <span>Inicio</span>
                                </div>
                                <div className="text-sm font-semibold text-[#06B6D4] mt-0.5">
                                    {fmtDateTime(ev.start_at)}
                                </div>
                            </div>

                            {ev.end_at && (
                                <div>
                                    <div className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/60">
                                        <CalendarClock className="h-3 w-3" />
                                        <span>Fin</span>
                                    </div>
                                    <div className="text-sm text-white/80 mt-0.5">
                                        {fmtDateTime(ev.end_at)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalle principal */}
                    <div
                        className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5
                       shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-5"
                    >
                        {/* Título + pills */}
                        <div>
                            <div className="text-lg font-semibold text-white/90">
                                {ev.title}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={typePill}>
                                    {ev.type === 'event' ? 'Evento' : 'Torneo'}
                                </span>
                                <span className={statusPill}>
                                    {ev.status === 'published'
                                        ? 'Publicado'
                                        : ev.status === 'draft'
                                            ? 'Borrador'
                                            : 'Archivado'}
                                </span>
                                {ev.location && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-white/15 bg-white/10 text-white/80">
                                        <MapPin className="h-3 w-3" />
                                        <span>{ev.location}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats rápidos */}
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-cyan-300" />
                                <div>
                                    <div className="text-[11px] uppercase tracking-wide text-white/55">
                                        Cupo
                                    </div>
                                    <div className="font-medium">
                                        {ev.capacity ?? 'Ilimitado'}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex items-center gap-2">
                                <Ticket className="h-4 w-4 text-emerald-300" />
                                <div>
                                    <div className="text-[11px] uppercase tracking-wide text-white/55">
                                        Registros
                                    </div>
                                    <div className="font-medium">
                                        {ev.registrations_count ?? 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-center gap-1 text-xs text-white/60 mb-1">
                                <AlignLeft className="h-3 w-3" />
                                <span>Descripción</span>
                            </div>
                            <p className="text-white/80 whitespace-pre-wrap">
                                {ev.description || '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
