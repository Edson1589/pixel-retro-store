import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/ui/Modals';
import { fetchMyRegistration, registerToEvent } from '../../services/api';

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
                // ignora errores silenciosamente (p.ej. 404 si no hay registro)
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
        <Modal open={open} onClose={onClose} title="Registro al evento" size="md"
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
            <div className="grid md:grid-cols-2 gap-3">
                <input
                    className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                    className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
                <input
                    className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                    placeholder="Gamer tag (opcional)"
                    value={form.gamer_tag}
                    onChange={(e) => setForm((s) => ({ ...s, gamer_tag: e.target.value }))}
                />
                <input
                    className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text-white/45
            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                    placeholder="Equipo (opcional)"
                    value={form.team}
                    onChange={(e) => setForm((s) => ({ ...s, team: e.target.value }))}
                />
                <textarea
                    className="md:col-span-2 rounded-xl px-3 py-2 bg-white/[0.05] text-white/90 placeholder:text白/45
            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                    rows={4}
                    placeholder="Notas (opcional)"
                    value={form.notes}
                    onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                />
            </div>

            {already?.registered && (
                <p className="mt-3 text-sm rounded-xl px-3 py-2 bg-amber-500/10 border border-amber-400/25 text-amber-200">
                    Ya te registraste a este evento{already.status ? ` (estado: ${already.status})` : ''}. No es necesario volver a enviar.
                </p>
            )}
            {error && (
                <p className="mt-3 text-sm rounded-xl px-3 py-2 bg-rose-500/10 border border-rose-400/25 text-rose-200">
                    {error}
                </p>
            )}
            <p className="mt-3 text-xs text-white/60">
                Al enviar aceptas nuestros términos y políticas. Si tienes cuenta e inicias sesión, tu registro se asociará a tu usuario.
            </p>
        </Modal>
    );
}
