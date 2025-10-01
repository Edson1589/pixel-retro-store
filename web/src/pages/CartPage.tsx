import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Modal from '../components/ui/Modal';
import CardField, { type CardValue } from '../components/checkout/CardField';
import { createPaymentIntent, confirmPaymentIntent, verify3ds } from '../services/payments';
import { getCustomerToken } from '../services/customerApi';
import { useNavigate, useLocation } from 'react-router-dom';

type Customer = { name: string; email: string; phone?: string; address?: string };
type Intent = { id: string; client_secret: string; amount: number; currency: string; status: string };

type CartListItem = {
    product?: { id: number; name: string; price: number | string };
    id?: number;
    name?: string;
    price?: number | string;
    quantity?: number;
    qty?: number;
};

type CreateIntentPayload = {
    customer: Customer;
    items: { product_id: number; qty: number }[];
    amount: number;
    currency: string;
};

type ConfirmResponse = {
    status: 'succeeded' | 'requires_action' | 'processing' | 'failed' | 'requires_payment_method';
    next_action?: 'otp' | 'redirect';
    client_secret?: string;
    id?: string;
    payment_ref?: string;
    sale_id?: number;
    total?: number;
    message?: string;
};

type Verify3DSResponse = {
    status: 'succeeded' | 'failed' | 'requires_action' | 'processing';
    payment_ref?: string;
    sale_id?: number;
    total?: number;
    message?: string;
};

const err = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'string' ? e : 'Error en checkout');

export default function CartPage() {
    const { items, remove, clear, total } = useCart();
    const nav = useNavigate();
    const loc = useLocation();

    const [form, setForm] = useState<Customer>({ name: '', email: '', phone: '', address: '' });
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const [intent, setIntent] = useState<Intent | null>(null);
    const [showCard, setShowCard] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [card, setCard] = useState<CardValue>({
        number: '4242 4242 4242 4242',
        cvc: '123',
        exp_month: '12',
        exp_year: '2030',
    });
    const [otp, setOtp] = useState('123456');

    const toLines = (): CreateIntentPayload['items'] =>
        (items as CartListItem[]).map((i) => ({
            product_id: i.product?.id ?? (i.id as number),
            qty: i.quantity ?? i.qty ?? 1,
        }));

    const start = async (): Promise<void> => {
        try {
            setBusy(true);
            setMsg(null);

            if (items.length === 0) throw new Error('Tu carrito está vacío.');
            if (!form.name || !form.email) throw new Error('Completa nombre y email.');

            if (!getCustomerToken()) {
                nav('/login', { state: { next: loc.pathname } });
                return;
            }

            const payload: CreateIntentPayload = {
                customer: form,
                items: toLines(),
                amount: Math.round(total * 100),
                currency: 'BOB',
            };

            const pi: Intent = await createPaymentIntent(payload);
            setIntent(pi);
            setShowCard(true);
        } catch (e) {
            setMsg(err(e));
        } finally {
            setBusy(false);
        }
    };

    const confirmCard = async () => {
        if (!intent) return;
        try {
            setBusy(true);
            setMsg(null);
            const r = (await confirmPaymentIntent(intent.id, {
                client_secret: intent.client_secret,
                card_number: card.number,
                exp_month: Number(card.exp_month),
                exp_year: Number(card.exp_year),
                cvc: card.cvc,
            })) as ConfirmResponse;

            if (r.status === 'requires_action') {
                setShowCard(false);
                setShowOtp(true);
                return;
            }
            if (r.status === 'succeeded' && r.payment_ref && r.sale_id != null && r.total != null) {
                clear();
                setShowCard(false);
                setIntent(null);
                nav('/checkout/success', { state: { payment_ref: r.payment_ref, sale_id: r.sale_id, total: r.total } });
            } else {
                setMsg(r.message ?? 'Pago no completado');
            }
        } catch (e) {
            setMsg(err(e));
        } finally {
            setBusy(false);
        }
    };

    const confirmOtp = async () => {
        if (!intent) return;
        try {
            setBusy(true);
            setMsg(null);
            const r = (await verify3ds(intent.id, {
                client_secret: intent.client_secret,
                otp,
            })) as Verify3DSResponse;

            if (r.status === 'succeeded' && r.payment_ref && r.sale_id != null && r.total != null) {
                clear();
                setShowOtp(false);
                setIntent(null);
                nav('/checkout/success', { state: { payment_ref: r.payment_ref, sale_id: r.sale_id, total: r.total } });
            } else {
                setMsg(r.message ?? 'Pago no completado');
            }
        } catch (e) {
            setMsg(err(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-4xl mx-auto p-4">
                {/* HERO */}
                <section
                    className="rounded-[20px] px-6 py-5 text-white
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                     shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                     border border-white/10 mb-6"
                >
                    <h2 className="text-center text-2xl font-extrabold tracking-wider">Carrito</h2>
                    <p className="mt-1 text-center text-white/90 text-sm">
                        Revisa tus productos y completa el pago de forma segura.
                    </p>
                </section>

                {items.length === 0 ? (
                    <div className="rounded-2xl p-6 text-white bg-white/[0.04] border border-white/10 text-center">
                        Tu carrito está vacío.
                    </div>
                ) : (
                    <>
                        {/* LISTA DE ITEMS */}
                        <section className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 text-white mb-6">
                            <ul className="divide-y divide-white/10">
                                {(items as CartListItem[]).map((i) => {
                                    const id = i.product?.id ?? i.id ?? Math.random();
                                    const name = i.product?.name ?? i.name ?? 'Producto';
                                    const qty = i.quantity ?? i.qty ?? 1;
                                    const price = Number(i.product?.price ?? i.price ?? 0);
                                    return (
                                        <li key={id} className="p-4 flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="text-[15px] font-semibold text-white/90">{name}</div>
                                                <div className="text-sm text-white/60">
                                                    {qty} × Bs. {price.toFixed(2)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => remove(i.product?.id ?? (i.id as number))}
                                                className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
                                            >
                                                Quitar
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* TOTAL + ACCIONES */}
                            <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
                                <div className="text-lg font-bold">
                                    <span className="text-white/70">Total:</span>{' '}
                                    <span className="text-[#06B6D4]">Bs. {total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={clear}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
                                >
                                    Vaciar
                                </button>
                            </div>
                        </section>

                        {/* DATOS DEL COMPRADOR */}
                        <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10 mb-4">
                            <h3 className="text-[15px] font-semibold mb-3 text-white/90">Datos del comprador</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                <input
                                    className="w-full rounded-xl px-3 py-2
                             bg-white/[0.05] text-white/90 placeholder:text-white/45
                             border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    placeholder="Nombre"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                <input
                                    className="w-full rounded-xl px-3 py-2
                             bg-white/[0.05] text-white/90 placeholder:text-white/45
                             border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                <input
                                    className="w-full rounded-xl px-3 py-2
                             bg-white/[0.05] text-white/90 placeholder:text-white/45
                             border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    placeholder="Teléfono"
                                    value={form.phone ?? ''}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                                <input
                                    className="w-full rounded-xl px-3 py-2
                             bg-white/[0.05] text-white/90 placeholder:text-white/45
                             border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    placeholder="Dirección"
                                    value={form.address ?? ''}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={busy || items.length === 0 || !form.name || !form.email}
                                onClick={start}
                                className="mt-1 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                           shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                           hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {busy ? 'Creando pago...' : 'Ir a pagar'}
                            </button>

                            {msg && <p className="mt-3 text-sm text-[#06B6D4]">{msg}</p>}
                        </section>
                    </>
                )}

                {/* MODAL TARJETA */}
                <Modal open={showCard} onClose={() => { setShowCard(false); setIntent(null); }} title="Pago con tarjeta">
                    {intent && (
                        <div className="text-white">
                            <div className="text-sm text-white/70 mb-3">
                                Intent: <code className="text-white/90">{intent.id}</code>{' '}
                                · Total:{' '}
                                <b className="text-[#06B6D4]">
                                    {(intent.amount / 100).toFixed(2)} {intent.currency}
                                </b>
                            </div>

                            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10">
                                <CardField value={card} onChange={setCard} />
                            </div>

                            <div className="text-xs text-white/60 mt-2">
                                Pruebas: <b>4242 4242 4242 4242</b> = éxito · <b>4000 0000 0000 3220</b> = requiere 3DS ·
                                <b> 0002</b> = rechazada · <b>9995</b> = fondos insuf. · <b>0069</b> = vencida
                            </div>

                            <button
                                onClick={confirmCard}
                                disabled={busy}
                                className="mt-3 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                           shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                           hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {busy ? 'Procesando...' : 'Confirmar pago'}
                            </button>
                        </div>
                    )}
                </Modal>

                {/* MODAL OTP */}
                <Modal open={showOtp} onClose={() => { setShowOtp(false); setIntent(null); }} title="Verificación 3-D Secure">
                    <div className="text-white">
                        <p className="text-sm text-white/70 mb-2">
                            Ingresa el código OTP (usa <b className="text-white">123456</b> para aprobar).
                        </p>
                        <input
                            className="border border-white/10 rounded-xl px-3 py-2 w-full
                         bg-white/[0.05] text-white/90 placeholder:text-white/45
                         focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D+/g, ''))}
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="one-time-code"
                            placeholder="Código OTP"
                        />
                        <button
                            onClick={confirmOtp}
                            disabled={busy}
                            className="mt-3 px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-medium
                         shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                         hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {busy ? 'Verificando...' : 'Aprobar pago'}
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
