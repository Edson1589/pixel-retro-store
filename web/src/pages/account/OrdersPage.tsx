import { useEffect, useState } from 'react';
import { listMyOrders, type OrdersPage as OrdersPageType, downloadReceipt } from '../../services/ordersApi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function OrdersPage() {
    const { user, loading } = useCustomerAuth();
    const nav = useNavigate();
    const [data, setData] = useState<OrdersPageType | null>(null);
    const [page, setPage] = useState(1);
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [dlErr, setDlErr] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;
        if (!user) { nav('/login', { replace: true }); return; }
        (async () => {
            try {
                setBusy(true); setErr(null);
                const res = await listMyOrders(page);
                setData(res);
            } catch (e) {
                setErr(e instanceof Error ? e.message : 'Error');
            } finally {
                setBusy(false);
            }
        })();
    }, [loading, user, page, nav]);

    if (loading) return <p className="p-4">Cargando...</p>;

    const hasPagination = !!data && (data.last_page ?? 1) > 1;
    const nextDisabled = data?.last_page !== undefined && page >= data.last_page;

    const handlePdf = async (id: number) => {
        try {
            setDlErr(null);
            await downloadReceipt(id);
        } catch (e) {
            setDlErr(e instanceof Error ? e.message : 'No se pudo descargar el PDF');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Mis compras</h1>
            {err && <p className="text-red-600">{err}</p>}
            {dlErr && <p className="text-red-600">{dlErr}</p>}
            {busy && <p>Cargando...</p>}

            {!busy && data && (
                <>
                    {data.data.length === 0 ? (
                        <p>No tienes compras todavía.</p>
                    ) : (
                        <ul className="divide-y border rounded-2xl overflow-hidden">
                            {data.data.map((o) => (
                                <li key={o.id} className="p-3 flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="font-semibold">Venta #{o.id}</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(o.created_at).toLocaleString()} · Estado: {o.status}
                                        </div>
                                        <div className="text-sm">Total: Bs. {Number(o.total).toFixed(2)}</div>
                                        {o.payment_ref && <div className="text-xs text-gray-500">Ref: {o.payment_ref}</div>}
                                    </div>
                                    <Link to={`/account/orders/${o.id}`} className="px-3 py-2 rounded-xl border">Ver</Link>
                                    <button onClick={() => handlePdf(o.id)} className="px-3 py-2 rounded-xl border">PDF</button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {hasPagination && (
                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-3 py-2 border rounded-xl disabled:opacity-50"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                Anterior
                            </button>
                            <button
                                className="px-3 py-2 border rounded-xl disabled:opacity-50"
                                onClick={() => setPage(p => p + 1)}
                                disabled={nextDisabled}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
