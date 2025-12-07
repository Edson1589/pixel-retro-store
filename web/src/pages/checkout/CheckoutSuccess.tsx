import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { downloadReceipt, getMyOrder } from '../../services/ordersApi';
import { signalInteract } from '../../services/telemetry';
import {
    AlertCircle,
    CheckCircle2,
    Hash,
    ReceiptText,
    ShoppingBag,
    FileDown,
    ArrowLeftCircle,
} from 'lucide-react';

type CheckoutState = {
    payment_ref: string;
    sale_id: number;
    total: number;
};

export default function CheckoutSuccess() {
    const location = useLocation();
    const state = location.state as CheckoutState | undefined;
    const { user } = useCustomerAuth();
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!state?.sale_id || !user) return;

        const key = `purchases-signalled-${state.sale_id}`;
        if (sessionStorage.getItem(key)) return;

        (async () => {
            try {
                const order = await getMyOrder(state.sale_id);
                await Promise.allSettled(
                    order.details.map(d =>
                        signalInteract(d.product_id, 'purchase', d.quantity || 1)
                    )
                );
                sessionStorage.setItem(key, '1');
            } catch {
                //
            }
        })();
    }, [state?.sale_id, user?.id]);

    const onDownload = async () => {
        try {
            setBusy(true);
            setMsg(null);
            if (!user) {
                setMsg('Inicia sesión para descargar el comprobante.');
                return;
            }
            await downloadReceipt(state!.sale_id);
        } catch (e) {
            setMsg(e instanceof Error ? e.message : 'No se pudo descargar el comprobante');
        } finally {
            setBusy(false);
        }
    };

    if (!state) {
        return (
            <div className="min-h-screen place-items-center bg-[#07101B] p-4">
                <div
                    className="w-[560px] max-w-full rounded-[22px] p-6
          bg-white/[0.04] border border-white/10 text-white
          shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] text-center space-y-4"
                >
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/15 grid place-items-center">
                        <AlertCircle className="h-6 w-6 text-amber-300" />
                    </div>

                    <h1
                        className="text-2xl font-extrabold
            bg-clip-text text-transparent
            bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]"
                    >
                        Pago exitoso (sin datos)
                    </h1>

                    <p className="text-white/75 text-sm">
                        No se encontraron datos de la transacción. Es posible que hayas recargado
                        la página o accedido directamente a esta URL.
                    </p>

                    <div className="pt-2">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-medium
              shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
              hover:brightness-110"
                        >
                            <ArrowLeftCircle className="h-4 w-4" />
                            <span>Volver al inicio</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[620px] max-w-full space-y-6">
                <section
                    className="rounded-[20px] px-8 py-6 text-white text-center
          bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
          shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
          border border-white/10"
                >
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-400/15 grid place-items-center mb-2">
                        <CheckCircle2 className="h-7 w-7 text-emerald-300" />
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-wider">
                        ¡Pago exitoso!
                    </h1>

                    <p className="mt-1 text-white/90 text-sm max-w-md mx-auto">
                        Gracias por tu compra. Hemos registrado tu pedido y te enviamos un
                        correo con todos los detalles de la transacción.
                    </p>
                </section>

                <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 bg-white/[0.05] border border-white/10">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <Hash className="h-3.5 w-3.5" />
                                <span>Referencia</span>
                            </div>
                            <div className="mt-1 font-semibold break-all text-sm">
                                {state.payment_ref}
                            </div>
                        </div>

                        <div className="rounded-xl p-3 bg-white/[0.05] border border-white/10">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <ReceiptText className="h-3.5 w-3.5" />
                                <span>Venta</span>
                            </div>
                            <div className="mt-1 font-semibold text-sm">#{state.sale_id}</div>
                        </div>

                        <div className="rounded-xl p-3 bg-white/[0.05] border border-white/10">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span>Total</span>
                            </div>
                            <div className="mt-1 font-bold text-[#06B6D4] text-lg">
                                Bs. {Number(state.total).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15
              border border-white/10 text-white text-sm"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span>Seguir comprando</span>
                        </Link>

                        <button
                            onClick={onDownload}
                            disabled={busy}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
              text-white font-medium text-sm
              shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
              hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileDown className="h-4 w-4" />
                            <span>{busy ? 'Descargando…' : 'Descargar comprobante (PDF)'}</span>
                        </button>
                    </div>

                    {!user && (
                        <p className="mt-1 text-sm text-white/70 text-center">
                            También podrás descargar tu comprobante luego en{' '}
                            <Link
                                className="text-[#06B6D4] hover:underline inline-flex items-center gap-1"
                                to="/account/orders"
                            >
                                <ReceiptText className="h-3.5 w-3.5" />
                                <span>Mis compras</span>
                            </Link>
                            .
                        </p>
                    )}

                    {msg && (
                        <p className="mt-2 text-sm text-red-400 text-center">{msg}</p>
                    )}
                </section>
            </div>
        </div>
    );

}
