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

    if (!state) {
        return (
            <div className="max-w-xl mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Pago exitoso</h1>
                <p className="text-gray-600">No se encontraron datos de la transacción (¿recargaste la página?).</p>
                <div className="mt-4">
                    <Link to="/" className="px-4 py-2 rounded-xl border">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    const onDownload = async () => {
        try {
            setBusy(true); setMsg(null);
            if (!user) { setMsg('Inicia sesión para descargar el comprobante.'); return; }
            await downloadReceipt(state.sale_id);
        } catch (e) {
            setMsg(e instanceof Error ? e.message : 'No se pudo descargar el comprobante');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">¡Pago exitoso!</h1>
            <p>Ref: <b>{state.payment_ref}</b></p>
            <p>Venta: <b>#{state.sale_id}</b></p>
            <p>Total: <b>Bs. {Number(state.total).toFixed(2)}</b></p>

            <div className="mt-4 flex gap-2 justify-center">
                <Link to="/" className="px-4 py-2 rounded-xl border">Seguir comprando</Link>
                <button
                    onClick={onDownload}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                >
                    {busy ? 'Descargando…' : 'Descargar comprobante (PDF)'}
                </button>
            </div>

            {!user && (
                <p className="mt-2 text-sm text-gray-600">
                    También podrás descargarlo luego en <Link className="underline" to="/account/orders">Mis Compras</Link>.
                </p>
            )}

            {msg && <p className="mt-2 text-red-600">{msg}</p>}
        </div>
    );
}
