import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminGetSale } from '../../../services/adminApi';
import type { Sale } from '../../../types';
import {
    ReceiptText,
    ArrowLeft,
    CalendarRange,
    Hash,
    CreditCard,
    Package,
    UserCircle2,
    Mail,
    Phone,
    MapPin,
    UserSquare2,
    FileText,
    Banknote,
    Tag,
    CheckCircle2,
    Clock4,
    Truck,
    Ban,
} from 'lucide-react';

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

    const paidBadge = () => {
        if (s.is_canceled) {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                   border border-rose-400/25 bg-rose-500/15 text-rose-200"
                >
                    <Ban className="h-3 w-3" />
                    <span>ANULADA</span>
                </span>
            );
        }

        if (s.status === 'paid') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                   border border-emerald-400/20 bg-emerald-500/15 text-emerald-300"
                >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>VENDIDA</span>
                </span>
            );
        }

        if (s.status === 'pending') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                   border border-amber-400/20 bg-amber-500/15 text-amber-300"
                >
                    <Clock4 className="h-3 w-3" />
                    <span>PENDIENTE</span>
                </span>
            );
        }

        return (
            <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                 border border-rose-400/20 bg-rose-500/15 text-rose-300"
            >
                <Ban className="h-3 w-3" />
                <span>{s.status?.toUpperCase()}</span>
            </span>
        );
    };

    const deliveryBadge = () => {
        if (s.is_canceled) return null;

        if (s.delivery_status === 'delivered') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                   border border-cyan-400/20 bg-cyan-500/15 text-cyan-300"
                >
                    <Truck className="h-3 w-3" />
                    <span>ENTREGADA</span>
                </span>
            );
        }

        if (s.delivery_status === 'to_deliver') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                   border border-indigo-400/20 bg-indigo-500/15 text-indigo-300"
                >
                    <Package className="h-3 w-3" />
                    <span>POR ENTREGAR</span>
                </span>
            );
        }

        return null;
    };

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-3xl text-white space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl
                       bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)]
                       shadow-[0_12px_30px_-14px_rgba(6,182,212,0.65)]
                       flex items-center justify-center"
                        >
                            <ReceiptText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                                Venta · #{s.id}
                            </h2>
                            <p className="text-xs text-white/60">
                                Detalle de la venta, cliente e ítems asociados.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/admin/sales"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl
                     border border-white/10 bg-white/[0.06] hover:bg-white/10 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
                </div>

                {/* RESUMEN + CLIENTE */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {/* RESUMEN */}
                    <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                                <Banknote className="h-4 w-4 text-emerald-300" />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                                    Resumen
                                </div>
                                <div className="text-sm font-semibold text-white/90">
                                    {money.format(s.total ?? 0)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-sm mt-1">
                            <div className="flex items-start gap-2">
                                <CalendarRange className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <span className="text-white/60 text-xs">Fecha</span>
                                    <div className="text-white/90">
                                        {s.created_at
                                            ? new Date(s.created_at).toLocaleString('es-BO')
                                            : '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Hash className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <span className="text-white/60 text-xs">Referencia / ID pago</span>
                                    <div className="text-white/90 break-all">
                                        {s.payment_ref ?? '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Package className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <span className="text-white/60 text-xs">Ítems vendidos</span>
                                    <div className="text-white/90">
                                        {s.items_qty ??
                                            (s.details?.reduce((a, d) => a + d.quantity, 0) ?? '—')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {paidBadge()}
                                {deliveryBadge()}
                            </div>

                            {s.pickup_doc_url ? (
                                <div className="pt-2">
                                    <a
                                        href={s.pickup_doc_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             border border-cyan-400/30 bg-cyan-500/10 text-cyan-300
                             hover:bg-cyan-500/20 hover:text-cyan-100"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>Ver documento de recojo</span>
                                    </a>
                                </div>
                            ) : (
                                <div className="pt-2 text-xs text-white/40 italic flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>Sin documento de recojo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CLIENTE */}
                    <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                                <UserCircle2 className="h-4 w-4 text-cyan-300" />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                                    Cliente
                                </div>
                                <div className="text-sm font-semibold text-white/90">
                                    {s.customer?.name ?? 'Sin cliente'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-sm mt-1">
                            <div className="flex items-start gap-2">
                                <UserCircle2 className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <div className="text-white/60 text-xs">Nombre</div>
                                    <div className="text-white/90">{s.customer?.name ?? '—'}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Hash className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <div className="text-white/60 text-xs">CI</div>
                                    <div className="text-white/90">{s.customer?.ci ?? '—'}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <div className="text-white/60 text-xs">Email</div>
                                    <div className="text-white/90 break-all">
                                        {s.customer?.email ?? '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <div className="text-white/60 text-xs">Teléfono</div>
                                    <div className="text-white/90">
                                        {s.customer?.phone ?? '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <div className="text-white/60 text-xs">Dirección</div>
                                    <div className="text-white/90">
                                        {s.customer?.address ?? '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-1">
                                <UserSquare2 className="h-4 w-4 text-white/50 mt-0.5" />
                                <div>
                                    <div className="text-white/60 text-xs">Registrado por</div>
                                    <div className="text-white/90">
                                        {s.user?.name ?? '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA DE DETALLES */}
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] text-white">
                    <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] text-white/70">
                            <tr>
                                <th className="p-3 text-left font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <Package className="h-3.5 w-3.5" />
                                        <span>Producto</span>
                                    </div>
                                </th>
                                <th className="p-3 text-center font-semibold">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" />
                                        <span>Cantidad</span>
                                    </div>
                                </th>
                                <th className="p-3 text-center font-semibold">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Banknote className="h-3.5 w-3.5" />
                                        <span>P. Unit</span>
                                    </div>
                                </th>
                                <th className="p-3 text-center font-semibold">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span>Subtotal</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {s.details?.map((d) => (
                                <tr key={d.id} className="hover:bg-white/[0.035]">
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                                                <img
                                                    src={d.product?.image_url || '/img/placeholder.jfif'}
                                                    alt={d.product?.name || 'Producto'}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '';
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate">
                                                    {d.product ? (
                                                        <Link
                                                            className="text-cyan-300 hover:underline"
                                                            to={`/admin/products/${d.product.id}`}
                                                        >
                                                            {d.product.name}
                                                        </Link>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </div>
                                                <div className="text-white/50 text-xs flex items-center gap-1">
                                                    {d.product?.sku && <Hash className="h-3 w-3" />}
                                                    <span>{d.product?.sku ?? ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-center tabular-nums">
                                        {d.quantity}
                                    </td>
                                    <td className="py-3 px-2 text-center tabular-nums">
                                        {money.format(d.unit_price)}
                                    </td>
                                    <td className="py-3 px-2 text-center font-semibold tabular-nums">
                                        {money.format(d.subtotal)}
                                    </td>
                                </tr>
                            ))}

                            {!s.details?.length && (
                                <tr>
                                    <td className="py-6 text-center text-white/70" colSpan={4}>
                                        Sin detalles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-white/[0.02]">
                            <tr>
                                <td className="p-3 text-right text-white/70" colSpan={3}>
                                    Total
                                </td>
                                <td className="p-3 text-center font-bold tabular-nums">
                                    {money.format(s.total ?? 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
