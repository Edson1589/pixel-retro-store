import { useEffect, useState } from 'react';
import { adminDeleteEvent, adminGetEvent } from '../../../services/adminApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    CalendarClock,
    MapPin,
    Users,
    AlertTriangle,
    Trash2,
    ArrowLeft,
} from 'lucide-react';

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

const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

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

    if (!ev) return <p className="text-white/70">Cargando…</p>;

    const typePill =
        ev.type === 'event'
            ? 'text-cyan-300 border-cyan-400/25 bg-cyan-500/15'
            : 'text-violet-300 border-violet-400/25 bg-violet-500/15';

    const statusPill =
        ev.status === 'published'
            ? 'text-emerald-300 border-emerald-400/25 bg-emerald-500/15'
            : ev.status === 'draft'
                ? 'text-white/75 border-white/20 bg-white/10'
                : 'text-rose-300 border-rose-400/25 bg-rose-500/15';

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                           bg-[linear-gradient(135deg,#f97373_0%,#fb7185_40%,#7C3AED_100%)]
                           shadow-[0_12px_30px_-14px_rgba(248,113,113,0.75)]
                           flex items-center justify-center"
                        >
                            <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#fb7185_0%,#f97316_40%,#facc15_100%)]">
                                Eliminar evento
                            </h2>
                            <p className="text-xs text-white/60">
                                Esta acción no se puede deshacer. Revisa bien antes de confirmar.
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/admin/events/${ev.id}`}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                       border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
                </div>

                {/* CARD DE CONFIRMACIÓN */}
                <div
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4"
                >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Banner */}
                        <div className="w-full sm:w-40 aspect-video rounded-xl border border-white/10 bg-white/[0.06] overflow-hidden grid place-items-center">
                            {ev.banner_url ? (
                                <img
                                    src={ev.banner_url}
                                    alt={ev.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-white/50">Sin banner</span>
                            )}
                        </div>

                        {/* Info evento */}
                        <div className="flex-1 space-y-2">
                            <div className="text-lg font-semibold text-white/90">
                                {ev.title}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${typePill}`}
                                >
                                    {ev.type === 'event' ? 'Evento' : 'Torneo'}
                                </span>

                                {ev.status && (
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${statusPill}`}
                                    >
                                        {ev.status === 'published'
                                            ? 'Publicado'
                                            : ev.status === 'draft'
                                                ? 'Borrador'
                                                : 'Archivado'}
                                    </span>
                                )}

                                {ev.location && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border border-white/15 bg-white/10 text-white/80">
                                        <MapPin className="h-3 w-3" />
                                        <span>{ev.location}</span>
                                    </span>
                                )}
                            </div>

                            {/* Meta: inicio / fin / cupo */}
                            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-sm">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <CalendarClock className="h-3 w-3" />
                                        <span>Inicio</span>
                                    </div>
                                    <div className="text-white/90">
                                        {fmt(ev.start_at)}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <CalendarClock className="h-3 w-3" />
                                        <span>Fin</span>
                                    </div>
                                    <div className="text-white/90">
                                        {fmt(ev.end_at)}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <Users className="h-3 w-3" />
                                        <span>Cupo</span>
                                    </div>
                                    <div className="text-white/90">
                                        {ev.capacity ?? 'Ilimitado'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aviso fuerte */}
                    <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-200 mt-0.5" />
                        <div className="text-sm">
                            ¿Seguro que deseas eliminar{' '}
                            <b>{ev.title}</b> (#{ev.id})?{' '}
                            <span className="text-rose-200 font-medium">
                                También se eliminarán sus registros. Esta acción no se puede deshacer.
                            </span>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={doDelete}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                           border border-rose-400/60 bg-rose-600/90 hover:bg-rose-500 text-sm
                           shadow-[0_12px_30px_-12px_rgba(225,29,72,0.6)]
                           disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{busy ? 'Eliminando…' : 'Sí, eliminar'}</span>
                        </button>

                        <Link
                            to={`/admin/events/${ev.id}`}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                           border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancelar</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

}
