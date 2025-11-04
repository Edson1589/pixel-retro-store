import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    adminLookupEvents,
    adminGetEvent,
    adminCreateEventRegistration,
    ConflictDuplicateError
} from '../../../services/adminApi';

import type {
    AdminEvent,
    AdminRegistration,
    EventLookupItem,
    WalkInCreatePayload
} from '../../../types';

type Toggle = 'pending' | 'confirmed';


export default function AdminEventWalkIn() {
    const navigate = useNavigate();

    const [query, setQuery] = useState<string>('');
    const [options, setOptions] = useState<EventLookupItem[]>([]);
    const [selected, setSelected] = useState<EventLookupItem | null>(null);
    const [eventFull, setEventFull] = useState<AdminEvent | null>(null);

    const [searching, setSearching] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    const [form, setForm] = useState<WalkInCreatePayload>({
        name: '',
        email: '',
        gamer_tag: '',
        team: '',
        notes: '',
        status: 'pending',
        force: false,
        send_email: false,
        check_in: false
    });

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [created, setCreated] = useState<AdminRegistration | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [duplicateInfo, setDuplicateInfo] = useState<string | null>(null);


    const handleSearch = async () => {
        setSearching(true);
        setHasSearched(true);
        setOptions([]);
        try {
            const rows = await adminLookupEvents({ search: query || undefined });
            setOptions(rows);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (!selected) { setEventFull(null); return; }
        let active = true;
        (async () => {
            const ev = await adminGetEvent(selected.id);
            if (!active) return;
            setEventFull(ev);
        })().catch(() => setEventFull(null));
        return () => { active = false; };
    }, [selected]);

    const disabled = submitting || !selected || form.name.trim().length === 0 || form.email.trim().length === 0;

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true);
        setError(null);
        setDuplicateInfo(null);
        setCreated(null);

        try {
            const reg = await adminCreateEventRegistration(selected.id, form);
            setCreated(reg);
            setForm((f) => ({
                ...f,
                name: '',
                email: '',
                gamer_tag: '',
                team: '',
                notes: '',
            }));
        } catch (e) {
            if (e instanceof ConflictDuplicateError) {
                setDuplicateInfo(`Este email ya está registrado en este evento (id #${e.payload.existing.id}, estado: ${e.payload.existing.status}).`);
            } else if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Error desconocido al crear el registro.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="text-white space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
          bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                    Registrar participante (en puerta)
                </h2>
                <button
                    onClick={() => navigate('/admin/events')}
                    className="ml-auto px-3 h-9 rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10"
                >
                    ← Volver a eventos
                </button>
            </div>

            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] space-y-3">
                <label className="block text-sm text-white/70 mb-1">Buscar evento / torneo</label>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
                        placeholder="Escribe el nombre o la ubicación…"
                        className="flex-1 h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none
                 focus:border-cyan-400/40 placeholder:text-white/40"
                    />
                    <button
                        type="button"
                        onClick={() => void handleSearch()}
                        disabled={searching}
                        className={`h-11 px-4 rounded-xl border text-white/90
        ${searching ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/[0.06]'
                                : 'border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15'}`}
                    >
                        {searching ? 'Buscando…' : 'Buscar'}
                    </button>
                </div>

                {hasSearched && (
                    options.length > 0 ? (
                        <div className="rounded-xl border border-white/10 bg-slate-900/60 max-h-64 overflow-auto">
                            {options.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { setSelected(opt); }}
                                    className="w-full text-left px-3 py-2 hover:bg-white/[0.06]"
                                >
                                    <div className="text-sm font-medium">{opt.title}</div>
                                    <div className="text-xs text-white/60">
                                        {opt.type === 'tournament' ? 'Torneo' : 'Evento'} · {opt.location ?? '—'} · {new Date(opt.start_at).toLocaleString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-white/50">{searching ? 'Buscando…' : 'Sin resultados'}</p>
                    )
                )}

                {selected && (
                    <div className="flex flex-wrap items-center gap-2 text-sm pt-1">
                        <span className="px-2.5 py-1 rounded-full border text-xs bg-white/[0.06] border-white/10">
                            {selected.type === 'tournament' ? 'Torneo' : 'Evento'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-xs ${(eventFull?.remaining_capacity ?? 1) > 0
                            ? 'text-emerald-300 border-emerald-400/25 bg-emerald-500/15'
                            : 'text-rose-300 border-rose-400/25 bg-rose-500/15'
                            }`}>
                            {eventFull?.remaining_capacity == null
                                ? 'Capacidad: —'
                                : eventFull.remaining_capacity <= 0
                                    ? 'Capacidad: sin cupos'
                                    : `Capacidad: quedan ${eventFull.remaining_capacity}`}
                        </span>
                        {eventFull?.location && (
                            <span className="px-2.5 py-1 rounded-full border text-xs bg-white/[0.06] border-white/10">
                                {eventFull.location}
                            </span>
                        )}
                        {eventFull?.start_at && (
                            <span className="px-2.5 py-1 rounded-full border text-xs bg-white/[0.06] border-white/10">
                                {new Date(eventFull.start_at).toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
            </div>


            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Nombre completo</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40"
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40"
                            placeholder="email@dominio.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Gamer tag</label>
                        <input
                            type="text"
                            value={form.gamer_tag ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, gamer_tag: e.target.value }))}
                            className="w-full h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40"
                            placeholder="Opcional"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Equipo</label>
                        <input
                            type="text"
                            value={form.team ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
                            className="w-full h-11 rounded-xl bg-white/10 border border-white/10 px-3 outline-none focus:border-cyan-400/40"
                            placeholder="Opcional"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm text-white/70 mb-1">Notas</label>
                        <textarea
                            value={form.notes ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            className="w-full min-h-[88px] rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none focus:border-cyan-400/40"
                            placeholder="Ej. Llega en puerta. Pagará en efectivo…"
                        />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <fieldset className="rounded-xl border border-white/10 p-3">
                        <legend className="px-2 text-sm text-white/70">Estado inicial</legend>
                        <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={form.status === 'pending'}
                                    onChange={() => setForm((f) => ({ ...f, status: 'pending' }))}
                                />
                                <span>Pendiente</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={form.status === 'confirmed'}
                                    onChange={() => setForm((f) => ({ ...f, status: 'confirmed' }))}
                                />
                                <span>Confirmado</span>
                            </label>
                        </div>
                    </fieldset>

                    <fieldset className="rounded-xl border border-white/10 p-3">
                        <legend className="px-2 text-sm text-white/70">Opciones</legend>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.check_in ?? false}
                                    onChange={(e) => setForm((f) => ({ ...f, check_in: e.target.checked }))}
                                />
                                <span>Check-in inmediato</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.send_email ?? false}
                                    onChange={(e) => setForm((f) => ({ ...f, send_email: e.target.checked }))}
                                />
                                <span>Enviar email si confirma</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.force ?? false}
                                    onChange={(e) => setForm((f) => ({ ...f, force: e.target.checked }))}
                                />
                                <span>Ignorar capacidad</span>
                            </label>
                        </div>
                    </fieldset>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <button
                        disabled={disabled}
                        onClick={() => void handleSubmit()}
                        className={`h-11 px-4 rounded-xl border text-white/90 transition
              ${disabled
                                ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/[0.06]'
                                : 'border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15'}`}
                    >
                        {submitting ? 'Registrando…' : 'Registrar participante'}
                    </button>

                    {selected && (
                        <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, status: (f.status === 'pending' ? 'confirmed' : 'pending') as Toggle }))}
                            className="h-11 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10"
                        >
                            {form.status === 'pending' ? 'Cambiar a Confirmado' : 'Cambiar a Pendiente'}
                        </button>
                    )}
                </div>

                {error && (
                    <p className="mt-3 text-sm text-rose-300">
                        {error}
                    </p>
                )}
                {duplicateInfo && (
                    <p className="mt-3 text-sm text-amber-300">
                        {duplicateInfo}
                    </p>
                )}
                {created && (
                    <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-100 text-sm">
                        <div className="font-semibold">¡Registro creado!</div>
                        <div>#{created.id} · {created.name} · {created.email} · Estado: {created.status}</div>
                        {created.ticket_code && <div>Ticket: <span className="font-mono">{created.ticket_code}</span></div>}
                    </div>
                )}
            </div>
        </div>
    );
}
