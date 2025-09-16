import { useLocation, Link } from 'react-router-dom';

type CheckoutState = {
    payment_ref: string;
    sale_id: number;
    total: number;
};

export default function CheckoutSuccess() {
    const location = useLocation();
    const state = location.state as CheckoutState | undefined;

    if (!state) {
        return (
            <div className="max-w-xl mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Pago exitoso</h1>
                <p className="text-gray-600">
                    No se encontraron datos de la transacción (¿recargaste la página?).
                </p>
                <div className="mt-4">
                    <Link to="/" className="px-4 py-2 rounded-xl border">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">¡Pago exitoso!</h1>
            <p>Ref: <b>{state.payment_ref}</b></p>
            <p>Venta: <b>#{state.sale_id}</b></p>
            <p>Total: <b>Bs. {Number(state.total).toFixed(2)}</b></p>
            <div className="mt-4">
                <Link to="/" className="px-4 py-2 rounded-xl border">Seguir comprando</Link>
            </div>
        </div>
    );
}
