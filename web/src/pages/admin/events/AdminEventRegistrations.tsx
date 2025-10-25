import { useEffect, useState } from 'react';
import { adminGetEvent, adminListEventRegs, adminUpdateRegStatus } from '../../../services/adminApi';
import { useParams } from 'react-router-dom';
import FancySelect, { type Option } from "../../../components/FancySelect";
import type { Page } from '../../../services/adminApi';

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

    return (
        <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                 bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                    Registros · {ev.title}
                </h2>

                <div className="ml-auto flex items-center gap-2">
                    <FancySelect
                        className="min-w-[180px]"
                        value={status}
                        onChange={(v) => setStatus(v as StatusFilter)}
                        options={statusOptions}
                        placeholder="Filtrar por estado"
                    />

                    {loading && <span className="text-sm text-white/70">Cargando...</span>}
                </div>
            </div>

            <div
                className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]
                   shadow-[0_0_0_1px_rgba(2,6,23,0.5),0_30px_80px_-25px_rgba(2,6,23,0.45)]"
            >
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-white/70">
                        <tr>
                            <th className="p-3 text-left font-semibold">Nombre</th>
                            <th className="p-3 text-center font-semibold">Email</th>
                            <th className="p-3 text-center font-semibold">Gamer Tag</th>
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
                                <td className="p-3">{r.name}</td>
                                <td className="p-3 text-center">{r.email}</td>
                                <td className="p-3 text-center">{r.gamer_tag || '—'}</td>
                                <td className="p-3 text-center">{r.team || '—'}</td>
                                <td className="p-3 text-center">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs ${statusPill(
                                            r.status
                                        )}`}
                                    >
                                        {r.status === 'confirmed'
                                            ? 'Confirmado'
                                            : r.status === 'pending'
                                                ? 'Pendiente'
                                                : 'Cancelado'}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="inline-flex gap-1.5">
                                        <button
                                            onClick={() => void change(r.id, 'confirmed')}
                                            className="px-2.5 py-1 rounded-lg text-xs
                                 border border-emerald-400/30 text-emerald-200 bg-emerald-500/10
                                 hover:bg-emerald-500/15"
                                        >
                                            Confirmar
                                        </button>
                                        <button
                                            onClick={() => void change(r.id, 'pending')}
                                            className="px-2.5 py-1 rounded-lg text-xs
                                 border border-amber-400/30 text-amber-200 bg-amber-500/10
                                 hover:bg-amber-500/15"
                                        >
                                            Pendiente
                                        </button>
                                        <button
                                            onClick={() => void change(r.id, 'cancelled')}
                                            className="px-2.5 py-1 rounded-lg text-xs
                                 border border-rose-400/30 text-rose-200 bg-rose-500/10
                                 hover:bg-rose-500/15"
                                        >
                                            Cancelar
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

            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="text-white/70 text-sm">
                    {data.total > 0
                        ? <>Mostrando <span className="text-white">{from}</span>–<span className="text-white">{to}</span> de <span className="text-white">{data.total}</span></>
                        : 'Sin resultados'}
                    <span className="ml-3 text-white/50">Página {data.current_page} de {data.last_page}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPage(1)}
                        disabled={!canPrev}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                            ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                        title="Primera página"
                    >
                        « Primero
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrev}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                            ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                        title="Anterior"
                    >
                        ‹ Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                        disabled={!canNext}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                            ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                        title="Siguiente"
                    >
                        Siguiente ›
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage(data.last_page)}
                        disabled={!canNext}
                        className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                            ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                        title="Última página"
                    >
                        Última »
                    </button>
                </div>
            </div>
        </div>
    );
}
