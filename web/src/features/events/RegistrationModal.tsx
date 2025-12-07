import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/ui/Modals';
import { fetchMyRegistration, registerToEvent } from '../../services/api';
import {
    User,
    Mail,
    Gamepad2,
    Users,
    StickyNote,
    Info,
} from 'lucide-react';

type Props = {
    slug: string;
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
};

type Form = {
    name: string;
    email: string;
    gamer_tag: string;
    team: string;
    notes: string;
};

function useDebounce<T>(value: T, delay = 450) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function RegistrationModal({ slug, open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<Form>({ name: '', email: '', gamer_tag: '', team: '', notes: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [already, setAlready] = useState<{ registered: boolean; status?: string } | null>(null);

    const debouncedEmail = useDebounce(form.email.trim(), 400);
    useEffect(() => {
        let abort = false;
        async function run() {
            if (!open) return;
            setAlready(null);
            if (!debouncedEmail) return;
            try {
                const res = await fetchMyRegistration(slug, debouncedEmail);
                if (!abort) setAlready(res);
            } catch {
                //
            }
        }
        void run();
        return () => { abort = true; };
    }, [debouncedEmail, open, slug]);

    const disabled = useMemo(() => {
        if (busy) return true;
        if (!form.name || !form.email) return true;
        if (already?.registered) return true;
        return false;
    }, [busy, form, already]);

    const submit = async () => {
        try {
            setBusy(true);
            setError(null);
            const res = await registerToEvent(slug, form);
            onSuccess(res?.message ?? 'Registro recibido. Te contactaremos para confirmar.');
            setForm({ name: '', email: '', gamer_tag: '', team: '', notes: '' });
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error en registro';
            setError(message.replace(/^\{?"?message"?\s*:\s*"?(.*?)"?\}?$/i, '$1'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Registro al evento"
            size="md"
            footer={
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.09]"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={disabled}
                        onClick={submit}
                        className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
            text-white font-medium shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
            hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy ? 'Enviando…' : 'Enviar registro'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4 text-white">
                <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                        <Gamepad2 className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="text-sm">
                        <p className="text-white/85 font-medium">
                            Completa tus datos para reservar tu cupo.
                        </p>
                        <p className="text-white/55 text-xs">
                            Usaremos esta información solo para gestionar el evento y enviarte
                            confirmaciones.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                    <div className="relative">
                        <User className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            className="w-full rounded-xl pl-9 pr-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
              border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Nombre"
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        />
                    </div>

                    <div className="relative">
                        <Mail className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            className="w-full rounded-xl pl-9 pr-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
              border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        />
                    </div>

                    <div className="relative">
                        <Gamepad2 className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            className="w-full rounded-xl pl-9 pr-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
              border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Gamer tag (opcional)"
                            value={form.gamer_tag}
                            onChange={(e) => setForm((s) => ({ ...s, gamer_tag: e.target.value }))}
                        />
                    </div>

                    <div className="relative">
                        <Users className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            className="w-full rounded-xl pl-9 pr-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
              border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            placeholder="Equipo (opcional)"
                            value={form.team}
                            onChange={(e) => setForm((s) => ({ ...s, team: e.target.value }))}
                        />
                    </div>

                    <div className="relative md:col-span-2">
                        <StickyNote className="h-4 w-4 text-white/50 absolute left-3 top-3 pointer-events-none" />
                        <textarea
                            className="w-full rounded-xl pl-9 pr-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
              border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            rows={4}
                            placeholder="Notas (opcional)"
                            value={form.notes}
                            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                        />
                    </div>
                </div>

                {already?.registered && (
                    <p className="mt-1 text-sm rounded-xl px-3 py-2 bg-amber-500/10 border border-amber-400/25 text-amber-200">
                        Ya te registraste a este evento
                        {already.status ? ` (estado: ${already.status})` : ''}. No es necesario volver a enviar.
                    </p>
                )}

                {error && (
                    <p className="mt-1 text-sm rounded-xl px-3 py-2 bg-rose-500/10 border border-rose-400/25 text-rose-200">
                        {error}
                    </p>
                )}

                <p className="mt-2 text-xs text-white/60 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 mt-0.5 text-white/50 flex-shrink-0" />
                    <span>
                        Al enviar aceptas nuestros términos y políticas. Si tienes cuenta e inicias sesión,
                        tu registro se asociará a tu usuario.
                    </span>
                </p>
            </div>
        </Modal>
    );

}
