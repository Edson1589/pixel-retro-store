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

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#07101B] p-4">
                <p className="text-white/70">Cargando…</p>
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-[#07101B]">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* HERO */}
                <section
                    className="rounded-[20px] px-8 py-6 text-white
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                     shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                     border border-white/10"
                >
                    <h1 className="text-center text-2xl font-extrabold tracking-wider">Mis compras</h1>
                    <p className="mt-1 text-center text-white/90 text-sm">
                        Revisa el estado de tus pedidos y descarga tus comprobantes.
                    </p>
                </section>

                {/* MENSAJES */}
                {err && <p className="text-sm text-red-400">{err}</p>}
                {dlErr && <p className="text-sm text-red-400">{dlErr}</p>}
                {busy && <p className="text-white/70">Cargando…</p>}

                {/* LISTA */}
                {!busy && data && (
                    <>
                        {data.data.length === 0 ? (
                            <div className="rounded-2xl p-6 text-white bg-white/[0.04] border border-white/10">
                                No tienes compras todavía.
                            </div>
                        ) : (
                            <section className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 text-white">
                                <ul className="divide-y divide-white/10">
                                    {data.data.map((o) => (
                                        <li key={o.id} className="p-4 flex flex-wrap items-center gap-3">
                                            <div className="flex-1 min-w-[240px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold text-white/90">Venta #{o.id}</div>
                                                    <span className={badgeFor(o.status)}>{o.status}</span>
                                                </div>
                                                <div className="text-sm text-white/60">
                                                    {new Date(o.created_at).toLocaleString('es-BO')} · Total:{' '}
                                                    <span className="text-[#06B6D4] font-medium">Bs. {Number(o.total).toFixed(2)}</span>
                                                </div>
                                                {o.payment_ref && (
                                                    <div className="text-xs text-white/50 break-all">Ref: {o.payment_ref}</div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/account/orders/${o.id}`}
                                                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15
                                     border border-white/10 text-white"
                                                >
                                                    Ver
                                                </Link>
                                                <button
                                                    onClick={() => handlePdf(o.id)}
                                                    className="px-3 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                                     shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                                     hover:brightness-110"
                                                >
                                                    PDF
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* PAGINACIÓN */}
                                {hasPagination && (
                                    <div className="p-4 flex flex-wrap items-center gap-3 justify-between">
                                        <div className="text-sm text-white/70">
                                            Página <span className="text-white/90 font-medium">{page}</span>
                                            {data?.last_page ? <> de <span className="text-white/90 font-medium">{data.last_page}</span></> : null}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15
                                   border border-white/10 text-white disabled:opacity-50"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page <= 1}
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                className="px-3 py-2 rounded-xl bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white font-medium
                                   shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                                   hover:brightness-110 disabled:opacity-50"
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={nextDisabled}
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}

                {/* CTA */}
                <div className="rounded-[18px] p-5 text-center text-white
                        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]/15
                        border border-white/10">
                    <p className="text-white/90">
                        ¿Necesitas ayuda con un pedido? <span className="font-semibold text-[#06B6D4]">Contáctanos</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
