import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Modal from '../components/ui/Modal';
import CardField, { type CardValue } from '../components/checkout/CardField';
import { createPaymentIntent, confirmPaymentIntent, verify3ds } from '../services/payments';
import { getCustomerToken } from '../services/customerApi';
import { useNavigate, useLocation } from 'react-router-dom';

type Customer = { name: string; email: string; phone?: string; address?: string };
type Intent = { id: string; client_secret: string; amount: number; currency: string; status: string };

// Ítems del carrito aceptados (soporta tanto {product, quantity} como {id,name,price,qty})
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

    // Estado de pago
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

    // Normaliza items a {product_id, qty}
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

            // exige sesión de cliente
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
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Carrito</h2>

            {items.length === 0 ? (
                <p>Tu carrito está vacío.</p>
            ) : (
                <>
                    <ul className="divide-y border rounded-2xl mb-4">
                        {(items as CartListItem[]).map((i) => {
                            const id = i.product?.id ?? i.id ?? Math.random();
                            const name = i.product?.name ?? i.name ?? 'Producto';
                            const qty = i.quantity ?? i.qty ?? 1;
                            const price = Number(i.product?.price ?? i.price ?? 0);
                            return (
                                <li key={id} className="p-3 flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="font-semibold">{name}</div>
                                        <div className="text-sm text-gray-500">
                                            {qty} × Bs. {price.toFixed(2)}
                                        </div>
                                    </div>
                                    <button onClick={() => remove(i.product?.id ?? (i.id as number))} className="text-sm underline">
                                        Quitar
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex justify-between items-center mb-6">
                        <div className="text-lg font-bold">Total: Bs. {total.toFixed(2)}</div>
                        <button onClick={clear} className="text-sm underline">
                            Vaciar
                        </button>
                    </div>

                    <h3 className="font-semibold mb-2">Datos del comprador</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <input
                            className="border rounded-xl px-3 py-2"
                            placeholder="Nombre"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <input
                            className="border rounded-xl px-3 py-2"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <input
                            className="border rounded-xl px-3 py-2"
                            placeholder="Teléfono"
                            value={form.phone ?? ''}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        <input
                            className="border rounded-xl px-3 py-2"
                            placeholder="Dirección"
                            value={form.address ?? ''}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={busy || items.length === 0 || !form.name || !form.email}
                        onClick={start}
                        className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                    >
                        {busy ? 'Creando pago...' : 'Ir a pagar'}
                    </button>

                    {msg && <p className="mt-4">{msg}</p>}
                </>
            )}

            {/* Modal tarjeta */}
            <Modal open={showCard} onClose={() => { setShowCard(false); setIntent(null); }} title="Pago con tarjeta">
                {intent && (
                    <>
                        <div className="text-sm text-gray-600 mb-2">
                            Intent: <code>{intent.id}</code> · Total: <b>{(intent.amount / 100).toFixed(2)} {intent.currency}</b>
                        </div>
                        <CardField value={card} onChange={setCard} />
                        <div className="text-xs text-gray-600 mt-2">
                            Pruebas: 4242 4242 4242 4242 = éxito · 4000 0000 0000 3220 = requiere 3DS · 0002 = rechazada · 9995 = fondos insuf. · 0069 = vencida
                        </div>
                        <button onClick={confirmCard} disabled={busy} className="mt-3 px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">
                            {busy ? 'Procesando...' : 'Confirmar pago'}
                        </button>
                    </>
                )}
            </Modal>

            {/* Modal OTP */}
            <Modal open={showOtp} onClose={() => { setShowOtp(false); setIntent(null); }} title="Verificación 3-D Secure">
                <p className="text-sm text-gray-600 mb-2">
                    Ingresa el código OTP (usa <b>123456</b> para aprobar).
                </p>
                <input
                    className="border rounded-xl px-3 py-2 w-full"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D+/g, ''))}
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="Código OTP"
                />
                <button onClick={confirmOtp} disabled={busy} className="mt-3 px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">
                    {busy ? 'Verificando...' : 'Aprobar pago'}
                </button>
            </Modal>
        </div>
    );
}
