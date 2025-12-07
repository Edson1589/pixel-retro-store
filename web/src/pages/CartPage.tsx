import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import Modal from '../components/ui/Modal';
import CardField, { type CardValue } from '../components/checkout/CardField';
import { createPaymentIntent, confirmPaymentIntent, verify3ds } from '../services/payments';
import { getCustomerToken } from '../services/customerApi';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Product } from '../types';
import {
    ShoppingCart,
    Trash2,
    User,
    IdCard,
    Mail,
    Phone,
    MapPin,
    FileUp,
    CreditCard,
    ShieldCheck,
    LockKeyhole,
} from 'lucide-react';

type Customer = {
    name: string;
    ci?: string;
    email: string;
    phone?: string;
    address?: string;
};

type Intent = { id: string; client_secret: string; amount: number; currency: string; status: string };

type CartListItem = {
    product?: (Product & { stock?: number }) | { id: number; name: string; price: number | string; stock?: number; image_url?: string };
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
    const { items, remove, clear, total, add } = useCart();
    const nav = useNavigate();
    const loc = useLocation();

    const stockIssues = useMemo(() => {
        const issues: { id: number; name: string; want: number; have: number }[] = [];
        (items as CartListItem[]).forEach((i) => {
            const id = i.product?.id ?? (i.id as number);
            const name = i.product?.name ?? i.name ?? `#${id}`;
            const want = i.quantity ?? i.qty ?? 1;
            const have = typeof i.product?.stock === 'number' ? i.product.stock! : Infinity;
            if (want > have) {
                issues.push({ id, name, want, have });
            }
        });
        return issues;
    }, [items]);

    const hasStockIssue = stockIssues.length > 0;

    const [form, setForm] = useState<Customer>({
        name: '',
        ci: '',
        email: '',
        phone: '',
        address: '',
    });

    const [pickupDocFile, setPickupDocFile] = useState<File | null>(null);

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

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    resolve(result);
                } else {
                    reject(new Error('No se pudo leer el archivo'));
                }
            };
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsDataURL(file);
        });
    };

    const start = async (): Promise<void> => {
        try {
            setMsg(null);

            if (items.length === 0) throw new Error('Tu carrito está vacío.');

            if (!getCustomerToken()) {
                nav('/login', { state: { next: loc.pathname } });
                return;
            }

            setShowCard(true);
        } catch (e) {
            setMsg(err(e));
        }
    };




    const confirmCard = async () => {
        if (!items.length) {
            setMsg('Tu carrito está vacío.');
            return;
        }

        if (!form.name || !form.email || !form.ci) {
            setMsg('Completa nombre, email y CI antes de confirmar el pago.');
            return;
        }

        try {
            setBusy(true);
            setMsg(null);

            let currentIntent = intent;

            if (!currentIntent) {
                let pickupDocB64: string | null = null;
                if (pickupDocFile) {
                    pickupDocB64 = await fileToDataUrl(pickupDocFile);
                }

                const payload = {
                    customer: {
                        name: form.name,
                        ci: form.ci || undefined,
                        email: form.email,
                        phone: form.phone || undefined,
                        address: form.address || undefined,
                    },
                    items: toLines(),
                    amount: Math.round(total * 100),
                    currency: 'BOB',
                    pickup_doc_b64: pickupDocB64,
                };

                const pi: Intent = await createPaymentIntent(payload);
                setIntent(pi);
                currentIntent = pi;
            }

            const r = (await confirmPaymentIntent(currentIntent.id, {
                client_secret: currentIntent.client_secret,
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
                nav('/checkout/success', {
                    state: { payment_ref: r.payment_ref, sale_id: r.sale_id, total: r.total },
                });
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
                nav('/checkout/success', {
                    state: { payment_ref: r.payment_ref, sale_id: r.sale_id, total: r.total },
                });
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
                <section
                    className="rounded-[20px] px-6 py-5 text-white
    bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
    shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
    border border-white/10 mb-6"
                >
                    <h2 className="text-center text-2xl font-extrabold tracking-wider flex items-center justify-center gap-2">
                        <ShoppingCart className="h-6 w-6" />
                        <span>Carrito</span>
                    </h2>
                    <p className="mt-1 text-center text-white/90 text-sm">
                        Revisa tus productos y completa el pago de forma segura.
                    </p>
                </section>


                {items.length === 0 ? (
                    <div className="rounded-2xl p-6 text-white bg-white/[0.04] border border-white/10 text-center flex flex-col items-center gap-3">
                        <ShoppingCart className="h-10 w-10 text-white/40" />
                        <p className="text-sm text-white/80">Tu carrito está vacío.</p>
                        <p className="text-xs text-white/60">
                            Agrega algunos juegos o consolas desde la tienda para comenzar tu pedido.
                        </p>
                    </div>
                ) : (


                    <>
                        <section className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 text-white mb-6">
                            <ul className="divide-y divide-white/10">
                                {(items as CartListItem[]).map((i) => {
                                    const id = i.product?.id ?? i.id ?? Math.random();
                                    const name = i.product?.name ?? i.name ?? 'Producto';
                                    const qty = i.quantity ?? i.qty ?? 1;
                                    const price = Number(i.product?.price ?? i.price ?? 0);
                                    return (
                                        <li key={id} className="p-4 flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                                                {(() => {
                                                    const img =
                                                        (i.product as { image_url?: string } | undefined)?.image_url ??
                                                        (i as unknown as { image_url?: string })?.image_url ??
                                                        undefined;
                                                    return img ? (
                                                        <img src={img} alt={name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-[linear-gradient(135deg,rgba(124,58,237,.25),rgba(6,182,212,.25))]" />
                                                    );
                                                })()}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-[15px] font-semibold text-white/90 truncate">{name}</div>
                                                <div className="text-sm text-white/60">
                                                    Bs. {price.toFixed(2)}{' '}
                                                    <span className="text-white/35">/ unidad</span>
                                                </div>
                                                <div className="text-xs text-white/45 mt-0.5">
                                                    {(typeof (i.product as { stock?: number } | undefined)?.stock === 'number') &&
                                                        `Stock: ${(i.product as { stock?: number })?.stock}`}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">

                                                <input
                                                    className="w-16 text-center rounded-lg px-2 py-1 bg-white/[0.06] border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                                    type="number"
                                                    min={1}
                                                    max={
                                                        typeof (i.product as { stock?: number } | undefined)?.stock === 'number'
                                                            ? (i.product as { stock?: number })!.stock!
                                                            : undefined
                                                    }
                                                    value={qty}
                                                    onChange={(e) => {
                                                        const current = qty;
                                                        let next = parseInt(e.target.value.replace(/\D+/g, '') || '1', 10);
                                                        if (Number.isNaN(next) || next < 1) next = 1;

                                                        const maxStock =
                                                            typeof (i.product as { stock?: number } | undefined)?.stock === 'number'
                                                                ? (i.product as { stock?: number })!.stock!
                                                                : Infinity;
                                                        if (next > maxStock) next = maxStock;

                                                        const p = i.product as Product | undefined;
                                                        if (!p) return;

                                                        const delta = next - current;
                                                        if (delta > 0) add(p, delta);
                                                        if (delta < 0) add(p, delta);
                                                    }}
                                                />
                                            </div>

                                            <button
                                                onClick={() => remove(i.product?.id ?? (i.id as number))}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
                                            >
                                                Quitar
                                            </button>
                                        </li>

                                    );
                                })}
                            </ul>

                            <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
                                <div className="text-lg font-bold flex items-center gap-2">
                                    <span className="text-white/70">Total:</span>
                                    <span className="text-[#06B6D4]">Bs. {total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={clear}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10
                                    inline-flex items-center gap-2 text-white/80"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Vaciar</span>
                                </button>
                            </div>

                        </section>

                        <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10 mb-4">
                            <h3 className="text-[15px] font-semibold mb-2 text-white/90">
                                Finalizar compra
                            </h3>
                            <p className="text-xs text-white/65 mb-3">
                                En el siguiente paso te pediremos tus datos y procesaremos el pago con tarjeta de forma segura.
                            </p>

                            <button
                                disabled={busy || items.length === 0 || hasStockIssue}
                                onClick={start}
                                className="mt-1 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
      shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
      hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span>{busy ? 'Creando pago...' : 'Ir a pagar'}</span>
                            </button>

                            {hasStockIssue && (
                                <div className="mt-2 text-sm text-amber-300/90">
                                    <p className="font-semibold">No hay stock suficiente:</p>
                                    <ul className="list-disc list-inside">
                                        {stockIssues.map((x) => (
                                            <li key={x.id}>
                                                {x.name}: solicitado {x.want}, disponible {x.have}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>

                    </>
                )}

                <Modal
                    open={showCard}
                    onClose={() => {
                        setShowCard(false);
                    }}
                    title="Pago con tarjeta"
                    maxWidthClass="max-w-lg sm:max-w-xl md:max-w-6xl"
                >
                    <div className="text-white space-y-4">
                        <div className="text-sm text-white/70 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span className="opacity-70">Intent:</span>{' '}
                                <code className="text-white/90">
                                    {intent ? intent.id : 'Se generará al confirmar'}
                                </code>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                <span className="text-xs uppercase tracking-[0.16em] text-white/60">
                                    Total:{' '}
                                    <b className="text-[#06B6D4]">
                                        {(
                                            intent
                                                ? intent.amount / 100
                                                : total
                                        ).toFixed(2)}{' '}
                                        BOB
                                    </b>
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#06B6D4]" />
                                    <span>Datos del comprador</span>
                                </h4>

                                <div className="relative">
                                    <User className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        className="w-full rounded-xl pl-9 pr-3 py-2
                            bg-white/[0.05] text-white/90 placeholder:text-white/45
                            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                        placeholder="Nombre completo"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>

                                <div className="relative">
                                    <IdCard className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        className="w-full rounded-xl pl-9 pr-3 py-2
                            bg-white/[0.05] text-white/90 placeholder:text-white/45
                            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                        placeholder="CI / Documento de identidad"
                                        value={form.ci ?? ''}
                                        onChange={(e) => setForm({ ...form, ci: e.target.value })}
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        className="w-full rounded-xl pl-9 pr-3 py-2
                            bg-white/[0.05] text-white/90 placeholder:text-white/45
                            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                <div className="relative">
                                    <Phone className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        className="w-full rounded-xl pl-9 pr-3 py-2
                            bg-white/[0.05] text-white/90 placeholder:text-white/45
                            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                        placeholder="Teléfono"
                                        value={form.phone ?? ''}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>

                                <div className="relative">
                                    <MapPin className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        className="w-full rounded-xl pl-9 pr-3 py-2
                            bg-white/[0.05] text-white/90 placeholder:text-white/45
                            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                        placeholder="Dirección"
                                        value={form.address ?? ''}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col text-white/80 text-sm">
                                    <label className="text-white/60 text-xs mb-1 flex items-center gap-1">
                                        <FileUp className="h-3 w-3" />
                                        <span>Documento del recojo (foto CI o autorización, opcional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="w-full rounded-xl px-3 py-2 bg-white/[0.05] text-white/90
                            border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]
                            file:mr-2 file:px-3 file:py-1 file:rounded-lg file:border-0
                            file:bg-white/20 file:text-white/90 file:text-xs"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] ?? null;
                                            setPickupDocFile(f);
                                        }}
                                    />
                                    {pickupDocFile && (
                                        <div className="text-[11px] text-white/50 mt-1 truncate">
                                            {pickupDocFile.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-[#06B6D4]" />
                                    <span>Datos de la tarjeta</span>
                                </h4>

                                <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10">
                                    <CardField value={card} onChange={setCard} />
                                </div>

                                <div className="text-xs text-white/60">
                                    Pruebas:{' '}
                                    <b>4242 4242 4242 4242</b> = éxito ·{' '}
                                    <b>4000 0000 0000 3220</b> = requiere 3DS ·
                                    <b> 0002</b> = rechazada · <b>9995</b> = fondos insuf. ·{' '}
                                    <b>0069</b> = vencida
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={confirmCard}
                            disabled={busy}
                            className="mt-1 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                            <CreditCard className="h-4 w-4" />
                            <span>{busy ? 'Procesando...' : 'Confirmar pago'}</span>
                        </button>

                        {msg && <p className="mt-3 text-sm text-[#06B6D4]">{msg}</p>}
                    </div>
                </Modal>


                <Modal
                    open={showOtp}
                    onClose={() => {
                        setShowOtp(false);
                        setIntent(null);
                    }}
                    title="Verificación 3-D Secure"
                >
                    <div className="text-white space-y-3">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-400/50 flex items-center justify-center">
                                <LockKeyhole className="h-5 w-5 text-amber-300" />
                            </div>
                            <p className="text-sm text-white/70 max-w-sm">
                                Hemos enviado un código de verificación temporal (OTP).
                                Usa <b className="text-white">123456</b> para aprobar la simulación del pago.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute left-1.5 top-1.5 bottom-1.5 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                                <LockKeyhole className="h-4 w-4 text-white/60" />
                            </div>
                            <input
                                className="border border-white/10 rounded-xl pl-11 pr-3 py-2 w-full
          bg-white/[0.05] text-white/90 placeholder:text-white/45
          focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]
          tracking-[0.3em] text-center"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D+/g, ''))}
                                inputMode="numeric"
                                maxLength={6}
                                autoComplete="one-time-code"
                                placeholder="Código OTP"
                            />
                        </div>

                        <button
                            onClick={confirmOtp}
                            disabled={busy}
                            className="mt-1 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
        text-white font-medium shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
        hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
        inline-flex items-center gap-2 mx-auto"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span>{busy ? 'Verificando...' : 'Aprobar pago'}</span>
                        </button>

                        {msg && <p className="mt-2 text-sm text-[#06B6D4]" aria-live="polite">{msg}</p>}
                    </div>
                </Modal>
            </div>
        </div>
    );
}
