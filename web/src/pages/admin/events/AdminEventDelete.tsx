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
        <div className="text-white space-y-5 max-w-2xl mx-auto px-4">
            {/* Título */}
            <h2
                className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                   bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
            >
                Eliminar evento
            </h2>

            {/* Resumen del evento */}
            <div
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)] space-y-4"
            >
                <div className="flex items-start gap-4">
                    <div className="w-36 aspect-video rounded-xl border border-white/10 bg-white/[0.06] overflow-hidden grid place-items-center">
                        {ev.banner_url ? (
                            <img src={ev.banner_url} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs text-white/50">Sin banner</span>
                        )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                        <div className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                        ">{ev.title}</div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs border ${typePill}`}>
                                {ev.type === 'event' ? 'Evento' : 'Torneo'}
                            </span>
                            {ev.status && (
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs border ${statusPill}`}>
                                    {ev.status === 'published' ? 'Publicado' : ev.status === 'draft' ? 'Borrador' : 'Archivado'}
                                </span>
                            )}
                            {ev.location && (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs border border-white/15 bg-white/10 text-white/80">
                                    {ev.location}
                                </span>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 pt-2">
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="text-xs text-white/60">Inicio</div>
                                <div className="mt-0.5 text-white/90">{fmt(ev.start_at)}</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="text-xs text-white/60">Fin</div>
                                <div className="mt-0.5 text-white/90">{fmt(ev.end_at)}</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="text-xs text-white/60">Cupo</div>
                                <div className="mt-0.5 text-white/90">{ev.capacity ?? 'Ilimitado'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerta destructiva */}
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
                    <div className="text-sm">
                        ¿Seguro que deseas eliminar <b>{ev.title}</b> (#{ev.id})?{' '}
                        <span className="text-rose-200 font-medium">
                            También se eliminarán sus registros. Esta acción no se puede deshacer.
                        </span>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                    <button
                        onClick={doDelete}
                        disabled={busy}
                        className="px-4 py-2 rounded-xl text-white
                       bg-rose-600 hover:bg-rose-500 disabled:opacity-60
                       shadow-[0_12px_30px_-12px_rgba(225,29,72,0.6)]"
                    >
                        {busy ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                    <Link
                        to={`/admin/events/${ev.id}`}
                        className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Cancelar
                    </Link>
                </div>
            </div>
        </div>
    );
}
