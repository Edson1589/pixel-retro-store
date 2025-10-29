import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminGetSale } from '../../../services/adminApi';
import type { Sale } from '../../../types';

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

export default function AdminSaleShow() {
    const { id } = useParams<{ id: string }>();
    const [s, setS] = useState<Sale | null>(null);

    useEffect(() => {
        const sid = Number(id);
        if (!id || Number.isNaN(sid)) return;

        let cancelled = false;
        (async () => {
            const sale = await adminGetSale(sid);
            if (!cancelled) setS(sale);
        })();

        return () => { cancelled = true; };
    }, [id]);


    if (!s) return <p className="text-white/70">Cargando…</p>;

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                >
                    Venta · #{s.id}
                </h2>

                <div className="ml-auto flex gap-2">
                    <Link
                        to="/admin/sales"
                        className="px-3 py-2 rounded-xl text-sm border text-white border-white/15 bg-white/[0.04] hover:bg-white/[0.07]"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-white/70 text-sm mb-2">Resumen</div>
                    <div className="space-y-1 text-sm">
                        <div><span className="text-white/60">Fecha:</span> {s.created_at ? new Date(s.created_at).toLocaleString('es-BO') : '—'}</div>
                        <div><span className="text-white/60">Referencia:</span> {s.payment_ref ?? '—'}</div>
                        <div><span className="text-white/60">Total:</span> <span className="font-semibold">{money.format(s.total ?? 0)}</span></div>
                        <div><span className="text-white/60">Ítems:</span> {s.items_qty ?? (s.details?.reduce((a, d) => a + d.quantity, 0) ?? '—')}</div>

                        {s.pickup_doc_url ? (
                            <div className="pt-2">
                                <a
                                    href={s.pickup_doc_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-1.5 rounded-lg text-xs font-medium
                           border border-cyan-400/30 bg-cyan-500/10 text-cyan-300
                           hover:bg-cyan-500/20 hover:text-cyan-200"
                                >
                                    Ver documento de recojo
                                </a>
                            </div>
                        ) : (
                            <div className="pt-2 text-xs text-white/40 italic">
                                Sin documento de recojo
                            </div>
                        )}
                    </div>

                </div>

                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-white/70 text-sm mb-2">Cliente</div>
                    <div className="space-y-1 text-sm">
                        <div><span className="text-white/60">Nombre:</span> {s.customer?.name ?? '—'}</div>
                        <div><span className="text-white/60">CI:</span> {s.customer?.ci ?? '—'}</div>
                        <div><span className="text-white/60">Email:</span> {s.customer?.email ?? '—'}</div>
                        <div><span className="text-white/60">Teléfono:</span> {s.customer?.phone ?? '—'}</div>
                        <div><span className="text-white/60">Dirección:</span> {s.customer?.address ?? '—'}</div>
                        <div><span className="text-white/60">Registrado por:</span> {s.user?.name ?? '—'}</div>
                    </div>
                </div>

            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] text-white">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-white/70">
                        <tr>
                            <th className="p-3 text-left font-semibold">Producto</th>
                            <th className="p-3 text-center font-semibold">Cantidad</th>
                            <th className="p-3 text-center font-semibold">P. Unit</th>
                            <th className="p-3 text-center font-semibold">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {s.details?.map(d => (
                            <tr key={d.id} className="hover:bg-white/[0.035]">
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                                            <img
                                                src={d.product?.image_url || '/img/placeholder.jfif'}
                                                alt={d.product?.name || 'Producto'}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.currentTarget.src = ''; }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate">
                                                {d.product ? (
                                                    <Link className="text-cyan-300 hover:underline" to={`/admin/products/${d.product.id}`}>
                                                        {d.product.name}
                                                    </Link>
                                                ) : '—'}
                                            </div>
                                            <div className="text-white/50 text-xs">{d.product?.sku ?? ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-center tabular-nums">{d.quantity}</td>
                                <td className="py-3 px-2 text-center tabular-nums">{money.format(d.unit_price)}</td>
                                <td className="py-3 px-2 text-center font-semibold tabular-nums">{money.format(d.subtotal)}</td>
                            </tr>
                        ))}
                        {!s.details?.length && (
                            <tr><td className="py-6 text-center text-white/70" colSpan={4}>Sin detalles.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="bg-white/[0.02]">
                        <tr>
                            <td className="p-3 text-right text-white/70" colSpan={3}>Total</td>
                            <td className="p-3 text-center font-bold">{money.format(s.total ?? 0)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
