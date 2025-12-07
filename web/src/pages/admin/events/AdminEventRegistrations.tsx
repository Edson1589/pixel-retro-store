import { useEffect, useState } from 'react';
import { adminGetEvent, adminListEventRegs, adminUpdateRegStatus } from '../../../services/adminApi';
import { useParams } from 'react-router-dom';
import FancySelect, { type Option } from "../../../components/FancySelect";
import type { Page } from '../../../services/adminApi';
import {
    Users as UsersIcon,
    Filter,
    UserCircle2,
    Mail,
    Gamepad2,
    Users,
    CheckCircle2,
    Clock3,
    XCircle,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
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

export default function AdminEventRegistrations() {
    const { id } = useParams<{ id: string }>();
    const [ev, setEv] = useState<AdminEvent | null>(null);

    const [data, setData] = useState<Page<Registration>>({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [status, setStatus] = useState<StatusFilter>('all');
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [perPage] = useState(20);

    const loadEvent = async () => {
        if (!id) return;
        const eventData = (await adminGetEvent(Number(id))) as AdminEvent;
        setEv(eventData);
    };

    const loadRegs = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const regs = await adminListEventRegs<Registration>(
                Number(id),
                {
                    page,
                    perPage,
                    status: status === 'all' ? undefined : status,
                }
            );
            setData(regs);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void loadEvent(); }, [id]);

    useEffect(() => { void loadRegs(); }, [id, page, perPage, status]);

    useEffect(() => { setPage(1); }, [status, perPage]);
    useEffect(() => { if (id) setPage(1); }, [id]);

    const change = async (regId: number | string, st: RegStatus) => {
        if (!id) return;
        setLoading(true);
        await adminUpdateRegStatus(Number(id), Number(regId), st);
        await loadRegs();
    };

    if (!ev) return <p className="text-white/70">Cargando…</p>;

    const statusPill = (s: RegStatus) =>
        s === 'confirmed'
            ? 'text-emerald-300 border-emerald-400/25 bg-emerald-500/15'
            : s === 'pending'
                ? 'text-amber-300 border-amber-400/25 bg-amber-500/15'
                : 'text-rose-300 border-rose-400/25 bg-rose-500/15';

    const statusOptions: Option[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Pendientes', value: 'pending' },
        { label: 'Confirmados', value: 'confirmed' },
        { label: 'Cancelados', value: 'cancelled' },
    ];

    const canPrev = data.current_page > 1;
    const canNext = data.current_page < data.last_page;
    const from = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const to = Math.min(data.current_page * data.per_page, data.total);
    const confirmedOnPage = data.data.filter((r) => r.status === 'confirmed').length;
    const pendingOnPage = data.data.filter((r) => r.status === 'pending').length;
    const cancelledOnPage = data.data.filter((r) => r.status === 'cancelled').length;


    return (
        <div className="text-white space-y-5">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-2xl
                     bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                     shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                     flex items-center justify-center"
                    >
                        <UsersIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2
                            className="text-xl font-extrabold tracking-wide bg-clip-text text-transparent
                       bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                        >
                            Registros · {ev.title}
                        </h2>
                        <p className="text-xs text-white/60">
                            Gestiona los participantes inscritos y su estado dentro del evento.
                        </p>
                    </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <Filter className="h-4 w-4 text-white/55" />
                        <FancySelect
                            className="min-w-[180px]"
                            value={status}
                            onChange={(v) => setStatus(v as StatusFilter)}
                            options={statusOptions}
                            placeholder="Filtrar por estado"
                        />
                    </div>

                    {loading && (
                        <span className="text-xs sm:text-sm text-white/70">Cargando…</span>
                    )}
                </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/25 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Confirmados (pág.)
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {confirmedOnPage}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/25 flex items-center justify-center">
                        <Clock3 className="h-4 w-4 text-amber-200" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Pendientes (pág.)
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {pendingOnPage}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-rose-500/25 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-rose-100" />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Cancelados (pág.)
                        </div>
                        <div className="text-lg font-semibold text-white/90 tabular-nums">
                            {cancelledOnPage}
                        </div>
                    </div>
                </div>
            </section>

            <div
                className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]
                 shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
            >
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-white/70">
                        <tr>
                            <th className="p-3 text-left font-semibold">Participante</th>
                            <th className="p-3 text-center font-semibold">Email</th>
                            <th className="p-3 text-center font-semibold">Gamer tag</th>
                            <th className="p-3 text-center font-semibold">Equipo</th>
                            <th className="p-3 text-center font-semibold">Estado</th>
                            <th className="p-3 text-center font-semibold">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.data.map((r) => (
                            <tr
                                key={r.id}
                                className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                            >
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                                            <UserCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-white/90">{r.name}</span>
                                    </div>
                                </td>

                                <td className="p-3 text-center">
                                    <div className="inline-flex items-center gap-1.5 text-white/85">
                                        <Mail className="h-4 w-4 text-white/50" />
                                        <span className="truncate max-w-[220px]">{r.email}</span>
                                    </div>
                                </td>

                                <td className="p-3 text-center">
                                    <div className="inline-flex items-center gap-1.5 text-white/85">
                                        <Gamepad2 className="h-4 w-4 text-white/50" />
                                        <span>{r.gamer_tag || '—'}</span>
                                    </div>
                                </td>

                                <td className="p-3 text-center">
                                    <div className="inline-flex items-center gap-1.5 text-white/85">
                                        <Users className="h-4 w-4 text-white/50" />
                                        <span>{r.team || '—'}</span>
                                    </div>
                                </td>

                                <td className="p-3 text-center">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs ${statusPill(
                                            r.status
                                        )}`}
                                    >
                                        {r.status === 'confirmed' && (
                                            <CheckCircle2 className="h-3 w-3" />
                                        )}
                                        {r.status === 'pending' && <Clock3 className="h-3 w-3" />}
                                        {r.status === 'cancelled' && <XCircle className="h-3 w-3" />}

                                        <span className="ml-0.5">
                                            {r.status === 'confirmed'
                                                ? 'Confirmado'
                                                : r.status === 'pending'
                                                    ? 'Pendiente'
                                                    : 'Cancelado'}
                                        </span>
                                    </span>
                                </td>

                                <td className="p-3 text-center">
                                    <div className="inline-flex gap-1.5">
                                        <button
                                            onClick={() => void change(r.id, 'confirmed')}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]
                               border border-emerald-400/30 bg-emerald-500/10
                               hover:bg-emerald-500/15"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Confirmar</span>
                                        </button>
                                        <button
                                            onClick={() => void change(r.id, 'pending')}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]
                               border border-amber-400/30 bg-amber-500/10
                               hover:bg-amber-500/15"
                                        >
                                            <Clock3 className="h-3.5 w-3.5" />
                                            <span>Pendiente</span>
                                        </button>
                                        <button
                                            onClick={() => void change(r.id, 'cancelled')}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]
                               border border-rose-400/30 bg-rose-500/10
                               hover:bg-rose-500/15"
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            <span>Cancelar</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {data.data.length === 0 && (
                            <tr>
                                <td className="p-6 text-center text-white/60" colSpan={6}>
                                    No hay registros para este filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-between text-sm text-white/70">
                <div>
                    {data.total > 0 ? (
                        <>
                            Mostrando{' '}
                            <span className="text-white font-medium">{from}</span>–
                            <span className="text-white font-medium">{to}</span> de{' '}
                            <span className="text-white font-medium">{data.total}</span>
                        </>
                    ) : (
                        'Sin resultados'
                    )}
                    <span className="ml-3 text-white/50">
                        Página {data.current_page} de {data.last_page}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPage(1)}
                        disabled={!canPrev}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                      ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <ChevronsLeft className="h-3 w-3" />
                        <span>Primero</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrev}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                      ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <ChevronLeft className="h-3 w-3" />
                        <span>Anterior</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                        disabled={!canNext}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                      ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <span>Siguiente</span>
                        <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage(data.last_page)}
                        disabled={!canNext}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                      ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <span>Última</span>
                        <ChevronsRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );

}
