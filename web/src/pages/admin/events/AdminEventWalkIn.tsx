import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    adminLookupEvents,
    adminGetEvent,
    adminCreateEventRegistration,
    ConflictDuplicateError
} from '../../../services/adminApi';

import {
    Ticket,
    Search,
    ArrowLeft,
    UserCircle2,
    Mail,
    Gamepad2,
    Users,
    MapPin,
    CalendarClock,
    StickyNote,
    CheckCircle2,
    Settings2,
    AtSign,
} from 'lucide-react'

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
        <div className="flex justify-center">
            <div className="w-full max-w-2xl text-white space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                        >
                            <Ticket className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                           bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Registrar participante (en puerta)
                            </h2>
                            <p className="text-xs text-white/60">
                                Busca un evento o torneo y registra a un jugador con opciones de check-in inmediato.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/events')}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>

                {/* BLOQUE: BUSCAR EVENTO */}
                <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] space-y-3">
                    <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        <span>Buscar evento / torneo</span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') void handleSearch();
                                }}
                                placeholder="Nombre del evento, ubicación…"
                                className="h-10 w-full rounded-xl bg-white/10 border border-white/10
                         pl-9 pr-3 text-sm outline-none
                         text-white/90 placeholder:text-white/45
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleSearch()}
                            disabled={searching}
                            className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium transition
                        ${searching
                                    ? 'opacity-50 cursor-not-allowed border border-white/10 bg-white/[0.06]'
                                    : 'border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/15 shadow-[0_10px_25px_-12px_rgba(8,145,178,0.6)]'
                                }`}
                        >
                            <Search className="h-4 w-4" />
                            <span>{searching ? 'Buscando…' : 'Buscar'}</span>
                        </button>
                    </div>

                    {hasSearched &&
                        (options.length > 0 ? (
                            <div className="rounded-xl border border-white/10 bg-[#050816]/80 max-h-64 overflow-auto mt-2">
                                {options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            setSelected(opt);
                                        }}
                                        className="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] flex flex-col gap-0.5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
                                                    {opt.type === 'tournament' ? (
                                                        <Gamepad2 className="h-3.5 w-3.5 text-violet-300" />
                                                    ) : (
                                                        <Users className="h-3.5 w-3.5 text-cyan-300" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-white/90">{opt.title}</span>
                                            </div>
                                            <span className="text-[11px] px-2 py-0.5 rounded-full border text-white/70 border-white/15">
                                                {opt.type === 'tournament' ? 'Torneo' : 'Evento'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/60 pl-9">
                                            {opt.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {opt.location}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarClock className="h-3 w-3" />
                                                {new Date(opt.start_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-1 text-xs text-white/50">
                                {searching ? 'Buscando…' : 'Sin resultados para esta búsqueda.'}
                            </p>
                        ))}

                    {selected && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.06]">
                                {selected.type === 'tournament' ? (
                                    <Gamepad2 className="h-3 w-3" />
                                ) : (
                                    <Users className="h-3 w-3" />
                                )}
                                <span>{selected.type === 'tournament' ? 'Torneo' : 'Evento'}</span>
                            </span>

                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${(eventFull?.remaining_capacity ?? 1) > 0
                                    ? 'text-emerald-300 border-emerald-400/25 bg-emerald-500/15'
                                    : 'text-rose-300 border-rose-400/25 bg-rose-500/15'
                                    }`}
                            >
                                <Ticket className="h-3 w-3" />
                                {eventFull?.remaining_capacity == null
                                    ? 'Capacidad: —'
                                    : eventFull.remaining_capacity <= 0
                                        ? 'Capacidad: sin cupos'
                                        : `Capacidad: quedan ${eventFull.remaining_capacity}`}
                            </span>

                            {eventFull?.location && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.06]">
                                    <MapPin className="h-3 w-3" />
                                    {eventFull.location}
                                </span>
                            )}
                            {eventFull?.start_at && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.06]">
                                    <CalendarClock className="h-3 w-3" />
                                    {new Date(eventFull.start_at).toLocaleString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* FORMULARIO PARTICIPANTE */}
                <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.04] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Nombre */}
                        <div>
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <UserCircle2 className="h-3 w-3" />
                                <span>Nombre completo</span>
                            </label>
                            <div className="relative">
                                <UserCircle2 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                           pl-9 pr-3 text-sm outline-none
                           text-white/90 placeholder:text-white/45
                           focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>Email</span>
                            </label>
                            <div className="relative">
                                <Mail className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="email"
                                    value={form.email ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                           pl-9 pr-3 text-sm outline-none
                           text-white/90 placeholder:text-white/45
                           focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                    placeholder="email@dominio.com"
                                />
                            </div>
                        </div>

                        {/* Gamer tag */}
                        <div>
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <Gamepad2 className="h-3 w-3" />
                                <span>Gamer tag</span>
                            </label>
                            <div className="relative">
                                <AtSign className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={form.gamer_tag ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, gamer_tag: e.target.value }))}
                                    className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                           pl-9 pr-3 text-sm outline-none
                           text-white/90 placeholder:text-white/45
                           focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        {/* Equipo */}
                        <div>
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>Equipo</span>
                            </label>
                            <div className="relative">
                                <Users className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={form.team ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
                                    className="h-11 w-full rounded-xl bg-white/10 border border-white/10
                           pl-9 pr-3 text-sm outline-none
                           text-white/90 placeholder:text-white/45
                           focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        {/* Notas */}
                        <div className="md:col-span-2">
                            <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                                <StickyNote className="h-3 w-3" />
                                <span>Notas</span>
                            </label>
                            <div className="relative">
                                <StickyNote className="h-4 w-4 text-white/50 absolute left-3 top-3 pointer-events-none" />
                                <textarea
                                    value={form.notes ?? ''}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    className="w-full min-h-[88px] rounded-xl bg-white/10 border border-white/10
                           pl-9 pr-3 py-2 text-sm outline-none
                           text-white/90 placeholder:text-white/45
                           focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                                    placeholder="Ej. Llega en puerta, pagará en efectivo…"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ESTADO + OPCIONES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <fieldset className="rounded-xl border border-white/10 p-3">
                            <legend className="px-1 text-xs text-white/60 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Estado inicial</span>
                            </legend>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="accent-cyan-400"
                                        checked={form.status === 'pending'}
                                        onChange={() => setForm((f) => ({ ...f, status: 'pending' }))}
                                    />
                                    <span>Pendiente</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="accent-emerald-400"
                                        checked={form.status === 'confirmed'}
                                        onChange={() => setForm((f) => ({ ...f, status: 'confirmed' }))}
                                    />
                                    <span>Confirmado</span>
                                </label>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-xl border border-white/10 p-3">
                            <legend className="px-1 text-xs text-white/60 flex items-center gap-1">
                                <Settings2 className="h-3 w-3" />
                                <span>Opciones</span>
                            </legend>
                            <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-emerald-400"
                                        checked={form.check_in ?? false}
                                        onChange={(e) => setForm((f) => ({ ...f, check_in: e.target.checked }))}
                                    />
                                    <span>Check-in inmediato</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-cyan-400"
                                        checked={form.send_email ?? false}
                                        onChange={(e) => setForm((f) => ({ ...f, send_email: e.target.checked }))}
                                    />
                                    <span>Enviar email si confirma</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="accent-rose-400"
                                        checked={form.force ?? false}
                                        onChange={(e) => setForm((f) => ({ ...f, force: e.target.checked }))}
                                    />
                                    <span>Ignorar capacidad</span>
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    {/* BOTONES */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                            disabled={disabled}
                            onClick={() => void handleSubmit()}
                            className={`h-11 px-4 rounded-xl text-sm font-medium transition
                        ${disabled
                                    ? 'opacity-50 cursor-not-allowed border border-white/10 bg-white/[0.06]'
                                    : 'border border-cyan-400/40 bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)] shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)] hover:brightness-110'
                                }`}
                        >
                            {submitting ? 'Registrando…' : 'Registrar participante'}
                        </button>

                        {selected && (
                            <button
                                type="button"
                                onClick={() =>
                                    setForm((f) => ({
                                        ...f,
                                        status: (f.status === 'pending' ? 'confirmed' : 'pending') as Toggle,
                                    }))
                                }
                                className="h-11 px-3 rounded-xl border border-white/10 bg-white/[0.06]
                         text-sm text-white/80 hover:bg-white/10"
                            >
                                {form.status === 'pending'
                                    ? 'Cambiar a Confirmado'
                                    : 'Cambiar a Pendiente'}
                            </button>
                        )}
                    </div>

                    {/* MENSAJES */}
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
                            <div className="flex items-center gap-2 font-semibold">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>¡Registro creado!</span>
                            </div>
                            <div className="mt-1">
                                #{created.id} · {created.name} · {created.email} · Estado: {created.status}
                            </div>
                            {created.ticket_code && (
                                <div className="mt-1">
                                    Ticket:{' '}
                                    <span className="font-mono">
                                        {created.ticket_code}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
