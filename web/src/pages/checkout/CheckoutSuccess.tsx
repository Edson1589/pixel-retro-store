import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { downloadReceipt } from '../../services/ordersApi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

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
            <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
                <div className="w-[560px] max-w-full rounded-[22px] p-6
                        bg-white/[0.04] border border-white/10 text-white
                        shadow-[0_20px_60px_-25px_rgba(2,6,23,0.55)] text-center">
                    <h1 className="text-2xl font-extrabold
                         bg-clip-text text-transparent
                         bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                        Pago exitoso
                    </h1>
                    <p className="mt-2 text-white/75">
                        No se encontraron datos de la transacción (¿recargaste la página?).
                    </p>
                    <div className="mt-5">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-medium
                         shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                         hover:brightness-110"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
            <div className="w-[620px] max-w-full space-y-6">
                {/* HERO */}
                <section
                    className="rounded-[20px] px-8 py-6 text-white text-center
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                     shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                     border border-white/10"
                >
                    <div className="mx-auto h-10 w-10 rounded-full bg-white/15 grid place-items-center mb-2">
                        {/* check icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-wider">¡Pago exitoso!</h1>
                    <p className="mt-1 text-white/90 text-sm">
                        Gracias por tu compra. Te enviamos un correo con el detalle.
                    </p>
                </section>

                {/* DETALLE */}
                <section className="rounded-2xl p-5 text-white bg-white/[0.04] border border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 bg-white/[0.05] border border-white/10">
                            <div className="text-xs text-white/60">Referencia</div>
                            <div className="mt-0.5 font-semibold break-all">{state.payment_ref}</div>
                        </div>
                        <div className="rounded-xl p-3 bg-white/[0.05] border border-white/10">
                            <div className="text-xs text-white/60">Venta</div>
                            <div className="mt-0.5 font-semibold">#{state.sale_id}</div>
                        </div>
                        <div className="rounded-xl p-3 bg-white/[0.05] border border-white/10">
                            <div className="text-xs text-white/60">Total</div>
                            <div className="mt-0.5 font-bold text-[#06B6D4]">Bs. {Number(state.total).toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 justify-center">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15
                         border border-white/10 text-white"
                        >
                            Seguir comprando
                        </Link>

                        <button
                            onClick={onDownload}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                         shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
                         hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {busy ? 'Descargando…' : 'Descargar comprobante (PDF)'}
                        </button>
                    </div>

                    {!user && (
                        <p className="mt-2 text-sm text-white/70 text-center">
                            También podrás descargarlo luego en{' '}
                            <Link className="text-[#06B6D4] hover:underline" to="/account/orders">
                                Mis Compras
                            </Link>.
                        </p>
                    )}

                    {msg && <p className="mt-2 text-sm text-red-400 text-center">{msg}</p>}
                </section>
            </div>
        </div>
    );
}
