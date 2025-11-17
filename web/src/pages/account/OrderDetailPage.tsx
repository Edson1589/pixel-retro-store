import { useState, useEffect } from 'react';
import { getMyOrder, type Order, downloadReceipt } from '../../services/ordersApi';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
    ArrowLeft,
    Receipt,
    CreditCard,
    CalendarClock,
    FileDown,
    AlertCircle,
    Loader2,
    Package2,
    HelpCircle,
    ImageOff,
} from 'lucide-react';

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, loading } = useCustomerAuth();
    const nav = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [dlErr, setDlErr] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;
        if (!user) { nav('/login', { replace: true }); return; }
        if (!id) return;

        (async () => {
            try {
                setBusy(true); setErr(null);
                const data = await getMyOrder(Number(id));
                setOrder(data);
            } catch (e) {
                setErr(e instanceof Error ? e.message : 'Error');
            } finally {
                setBusy(false);
            }
        })();
    }, [loading, user, id, nav]);

    const badgeFor = (status: string) => {
        const s = status.toLowerCase();
        const base = 'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border';
        if (s.includes('paid') || s.includes('complet') || s.includes('success')) {
            return `${base} bg-emerald-400/10 text-emerald-300 border-emerald-400/20`;
        }
        if (s.includes('pend') || s.includes('proc')) {
            return `${base} bg-amber-400/10 text-amber-300 border-amber-400/20`;
        }
        if (s.includes('fail') || s.includes('cancel')) {
            return `${base} bg-rose-400/10 text-rose-300 border-rose-400/20`;
        }
        return `${base} bg-white/10 text-white/80 border-white/15`;
    };

    const onDownload = async () => {
        try {
            setDlErr(null);
            if (!order) return;
            await downloadReceipt(order.id);
        } catch (e) {
            setDlErr(e instanceof Error ? e.message : 'No se pudo descargar el PDF');
        }
    };

    if (loading || busy) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando…</span>
                </div>
            </div>
        );
    }

    if (err) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
                <div
                    className="w-[560px] max-w-full rounded-[22px] p-6
        bg-white/[0.04] border border-white/10 text-white
        shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] text-center"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-rose-500/15 border border-rose-400/40 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-rose-300" />
                        </div>
                        <p className="text-sm text-red-300">{err}</p>
                        <div className="mt-2">
                            <Link
                                to="/account/orders"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Volver a mis compras</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (!order) return null;

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Header */}
                <section
                    className="rounded-[20px] px-8 py-6 text-white
        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
        shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
        border border-white/10"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/account/orders"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-[#06B6D4]" />
                            </div>
                            <h1 className="ml-1 text-2xl font-extrabold tracking-wider">
                                Venta #{order.id}
                            </h1>
                        </div>
                    </div>

                    <p className="mt-1 text-white/90 text-sm">
                        Detalle de tu compra y comprobante.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Resumen y acciones */}
                    <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-white/70" />
                            <div className="text-white/80">Estado:</div>
                            <span className={badgeFor(order.status)}>{order.status}</span>
                        </div>

                        {order.payment_ref && (
                            <div className="mt-1">
                                <div className="flex items-center gap-1 text-xs text-white/60">
                                    <Receipt className="h-3 w-3" />
                                    <span>Referencia de pago</span>
                                </div>
                                <div className="font-medium break-all text-sm mt-0.5">
                                    {order.payment_ref}
                                </div>
                            </div>
                        )}

                        <div className="mt-1">
                            <div className="flex items-center gap-1 text-xs text-white/60">
                                <CalendarClock className="h-3 w-3" />
                                <span>Fecha</span>
                            </div>
                            <div className="font-medium mt-0.5">
                                {new Date(order.created_at).toLocaleString('es-BO')}
                            </div>
                        </div>

                        <div className="mt-3 text-lg flex items-center gap-2">
                            <span className="text-white/70 font-medium">Total:</span>
                            <b className="text-[#06B6D4]">
                                Bs. {Number(order.total).toFixed(2)}
                            </b>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={onDownload}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
              shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
              hover:brightness-110"
                            >
                                <FileDown className="h-4 w-4" />
                                <span>Descargar comprobante (PDF)</span>
                            </button>
                            {dlErr && (
                                <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{dlErr}</span>
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Lista de productos */}
                    <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Package2 className="h-4 w-4 text-[#06B6D4]" />
                            <h2 className="text-[15px] font-semibold text-white/90">
                                Productos
                            </h2>
                        </div>

                        <ul className="divide-y divide-white/10">
                            {order.details.map((d) => (
                                <li key={d.id} className="py-3 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/10 grid place-items-center">
                                        {d.product?.image_url ? (
                                            <img
                                                src={d.product.image_url}
                                                alt={d.product?.name ?? 'Producto'}
                                                className="h-full w-full object-contain p-2"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <ImageOff className="h-4 w-4 text-white/50" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white/90 truncate">
                                            {d.product?.name ?? `#${d.product_id}`}
                                        </div>
                                        <div className="text-sm text-white/60">
                                            {d.quantity} × Bs. {Number(d.unit_price).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="font-semibold text-white/90 whitespace-nowrap">
                                        Bs. {Number(d.subtotal).toFixed(2)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Banner de ayuda */}
                <div
                    className="rounded-[18px] p-5 text-center text-white
        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15
        border border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                    <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-[#06B6D4]" />
                    </div>
                    <p className="text-white/90 text-sm">
                        ¿Algún problema con tu pedido?{' '}
                        <span className="font-semibold text-[#06B6D4]">
                            Escríbenos y te ayudamos.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );

}
