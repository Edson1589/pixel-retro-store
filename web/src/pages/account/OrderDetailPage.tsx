import { useState, useEffect } from 'react';
import { getMyOrder, type Order, downloadReceipt } from '../../services/ordersApi';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

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

    if (loading || busy) return <p className="p-4">Cargando...</p>;
    if (err)
        return (
            <div className="p-4">
                <p className="text-red-600">{err}</p>
                <Link to="/account/orders" className="underline">Volver</Link>
            </div>
        );
    if (!order) return null;

    const onDownload = async () => {
        try {
            setDlErr(null);
            await downloadReceipt(order.id);
        } catch (e) {
            setDlErr(e instanceof Error ? e.message : 'No se pudo descargar el PDF');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex items-center gap-2">
                <Link to="/account/orders" className="underline text-sm">← Volver</Link>
                <h1 className="text-2xl font-bold ml-2">Venta #{order.id}</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
                <div className="border rounded-2xl p-3">
                    <div><b>Estado:</b> {order.status}</div>
                    {order.payment_ref && <div><b>Ref pago:</b> {order.payment_ref}</div>}
                    <div><b>Fecha:</b> {new Date(order.created_at).toLocaleString()}</div>
                    <div className="mt-2 text-lg"><b>Total:</b> Bs. {Number(order.total).toFixed(2)}</div>

                    <div className="mt-3">
                        <button onClick={onDownload} className="px-4 py-2 rounded-xl border">
                            Descargar comprobante (PDF)
                        </button>
                        {dlErr && <p className="mt-2 text-red-600">{dlErr}</p>}
                    </div>
                </div>

                <div className="border rounded-2xl p-3">
                    <div className="font-semibold mb-2">Productos</div>
                    <ul className="divide-y">
                        {order.details.map((d) => (
                            <li key={d.id} className="py-2 flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                    {d.product?.image_url ? (
                                        <img src={d.product.image_url} alt={d.product?.name ?? 'Producto'} className="w-full h-full object-cover" />
                                    ) : <span className="text-xs text-gray-400">IMG</span>}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{d.product?.name ?? `#${d.product_id}`}</div>
                                    <div className="text-sm text-gray-600">
                                        {d.quantity} × Bs. {Number(d.unit_price).toFixed(2)}
                                    </div>
                                </div>
                                <div className="font-semibold">Bs. {Number(d.subtotal).toFixed(2)}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
