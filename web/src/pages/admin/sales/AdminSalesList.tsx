import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    adminListSales,
    adminGetSalesSummary,
    adminExportSalesReport,
    adminDownloadReceipt,
    adminDeliverSale,
    adminDownloadDeliveryNote,
    adminVoidSale,
} from '../../../services/adminApi';

import type { Page } from '../../../services/adminApi';
import type { Sale, SalesSummary } from '../../../types';
import {
    ReceiptText,
    Search,
    CalendarRange,
    FileDown,
    XCircle,
    Banknote,
    ShoppingBag,
    Package,
    PackageOpen,
    Ban,
    CheckCircle2,
    Clock4,
    Truck,
    Tag,
    UserCircle2,
    Mail,
    Eye,
    FileText,
    CheckSquare,
    RotateCcw,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';

type StatusFilter = 'all' | 'pending' | 'paid' | 'failed';
const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

export default function AdminSalesList() {
    const [data, setData] = useState<Page<Sale>>({
        data: [], current_page: 1, last_page: 1, per_page: 20, total: 0,
    });
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState('');
    const [status] = useState<StatusFilter>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    const [draftDateFrom, setDraftDateFrom] = useState<string>('');
    const [draftDateTo, setDraftDateTo] = useState<string>('');

    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);

    const [rowBusyId, setRowBusyId] = useState<number | null>(null);

    const [rowBusyAction, setRowBusyAction] = useState<'deliver' | 'void' | 'note' | 'receipt' | null>(null);

    const [deliverySale, setDeliverySale] = useState<Sale | null>(null);
    const [deliveryCi, setDeliveryCi] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [deliveryError, setDeliveryError] = useState<string | null>(null);
    const [deliverySubmitting, setDeliverySubmitting] = useState(false);


    const onReceipt = async (id: number) => {
        setRowBusyId(id);
        setRowBusyAction('receipt');
        try {
            await adminDownloadReceipt(id);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'No se pudo descargar el recibo');
        } finally {
            setRowBusyId(null);
            setRowBusyAction(null);
        }
    };

    const openDeliveryModal = (s: Sale) => {
        setDeliverySale(s);
        setDeliveryCi('');
        setDeliveryNotes('');
        setDeliveryError(null);
    };

    const handleConfirmDelivery = async () => {
        if (!deliverySale) return;

        if (!deliveryCi.trim()) {
            setDeliveryError('Debes ingresar el CI de quien recoge.');
            return;
        }

        setDeliveryError(null);
        setDeliverySubmitting(true);
        setRowBusyId(deliverySale.id);
        setRowBusyAction('deliver');

        try {
            await adminDeliverSale(deliverySale.id, {
                ci: deliveryCi.trim(),
                notes: deliveryNotes.trim() || undefined,
            });

            // Recargar lista y resumen desde el servidor
            await Promise.all([
                load(),
                loadSummary(),
            ]);

            // Descargar la nota de entrega
            await adminDownloadDeliveryNote(deliverySale.id);

            // Cerrar modal
            setDeliverySale(null);
            setDeliveryCi('');
            setDeliveryNotes('');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'No se pudo marcar como entregada';
            setDeliveryError(msg);
        } finally {
            setDeliverySubmitting(false);
            setRowBusyId(null);
            setRowBusyAction(null);
        }
    };

    const onDownloadNote = async (s: Sale) => {
        setRowBusyId(s.id);
        setRowBusyAction('note');
        try {
            await adminDownloadDeliveryNote(s.id);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'No se pudo descargar la nota de entrega');
        } finally {
            setRowBusyId(null);
            setRowBusyAction(null);
        }
    };

    const onVoidSale = async (s: Sale) => {
        if (s.is_canceled) return;

        const reason = window.prompt('Motivo de anulación (opcional):') ?? '';

        setRowBusyId(s.id);
        setRowBusyAction('void');
        try {
            const updated = await adminVoidSale(s.id, reason.trim() || undefined);

            setData(prev => ({
                ...prev,
                data: prev.data.map(row => row.id === s.id ? updated : row),
            }));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'No se pudo anular la venta');
        } finally {
            setRowBusyId(null);
            setRowBusyAction(null);
        }
    };

    const applyDateFilter = () => {
        setDateFrom(draftDateFrom);
        setDateTo(draftDateTo);
        setPage(1);
    };

    const clearDateFilter = () => {
        setDraftDateFrom('');
        setDraftDateTo('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const onlyToday = !dateFrom && !dateTo;
            const r = await adminListSales({
                page, perPage, q: q || undefined,
                status: status === 'all' ? undefined : status,
                from: dateFrom || undefined, to: dateTo || undefined,
                today: onlyToday ? true : undefined,
            });
            setData(r);
        } finally { setLoading(false); }
    }, [page, perPage, q, status, dateFrom, dateTo]);

    const loadSummary = useCallback(async () => {
        const s = await adminGetSalesSummary({
            from: dateFrom || undefined, to: dateTo || undefined, limit: 100,
        });
        setSummary(s);
    }, [dateFrom, dateTo]);

    useEffect(() => { void load(); }, [load]);
    useEffect(() => { void loadSummary(); }, [loadSummary]);

    useEffect(() => { setPage(1); }, [q, status, dateFrom, dateTo]);

    const canPrev = data.current_page > 1;
    const canNext = data.current_page < data.last_page;
    const from = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const to = Math.min(data.current_page * data.per_page, data.total);

    const paidBadge = (s: Sale) => {
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
                    <span>VENDIDO</span>
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
                <span>{s.status.toUpperCase()}</span>
            </span>
        );
    };

    const deliveryBadge = (s: Sale) => {
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

        return (
            <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                 border border-indigo-400/20 bg-indigo-500/15 text-indigo-300"
            >
                <Package className="h-3 w-3" />
                <span>POR ENTREGAR</span>
            </span>
        );
    };

    const onExportPdf = async () => {
        setDownloadingPdf(true);
        try {
            await adminExportSalesReport({
                from: dateFrom || undefined,
                to: dateTo || undefined,
                status: status === 'all' ? undefined : status,
                q: q || undefined,
                format: 'pdf',
            });
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <div className="text-white space-y-5">
            {/* HEADER + BUSCADOR */}
            <div className="flex flex-wrap items-center gap-4">
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
                        <h2 className="text-xl font-extrabold bg-clip-text text-transparent
                         bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]">
                            Ventas
                        </h2>
                        <p className="text-xs text-white/60">
                            Resumen de ventas, entregas y reportes en PDF.
                        </p>
                    </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    {/* Buscador texto */}
                    <div className="relative">
                        <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            className="h-10 w-56 sm:w-64 rounded-xl bg-white/5 border border-white/10
                       pl-9 pr-3 text-sm text-white/90
                       placeholder:text-white/45
                       outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                            placeholder="Cliente, CI, email, ref, ID…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    {/* Filtro fechas */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <CalendarRange className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="date"
                                value={draftDateFrom}
                                onChange={(e) => setDraftDateFrom(e.target.value)}
                                className="h-10 rounded-xl bg-white/5 border border-white/10
                         pl-9 pr-3 text-sm text-white/90
                         outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                            />
                        </div>
                        <span className="text-white/45 text-xs sm:text-sm">→</span>
                        <div className="relative">
                            <CalendarRange className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="date"
                                value={draftDateTo}
                                onChange={(e) => setDraftDateTo(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyDateFilter();
                                }}
                                className="h-10 rounded-xl bg-white/5 border border-white/10
                         pl-9 pr-3 text-sm text-white/90
                         outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-[#06B6D488]"
                            />
                        </div>
                    </div>

                    {/* Botones filtro / limpiar / PDF */}
                    <button
                        type="button"
                        onClick={applyDateFilter}
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-white/10 bg-white/5 hover:bg-white/10
                     text-sm"
                        title="Aplicar filtro de fechas"
                    >
                        <Search className="h-4 w-4" />
                        <span>Filtrar</span>
                    </button>

                    <button
                        type="button"
                        onClick={clearDateFilter}
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     border border-white/10 bg-white/5 hover:bg-white/10
                     text-sm text-white/80"
                        title="Limpiar fechas"
                    >
                        <XCircle className="h-4 w-4" />
                        <span>Limpiar</span>
                    </button>

                    <button
                        type="button"
                        onClick={onExportPdf}
                        disabled={downloadingPdf}
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl
                     bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
                     text-sm font-medium
                     shadow-[0_12px_30px_-12px_rgba(124,58,237,0.8)]
                     hover:brightness-110
                     disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Descargar reporte PDF"
                    >
                        <FileDown className="h-4 w-4" />
                        <span>{downloadingPdf ? 'Generando…' : 'Reporte PDF'}</span>
                    </button>
                </div>
            </div>

            {/* RESUMEN RÁPIDO */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Card 1: total recaudado */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                            <Banknote className="h-4 w-4 text-emerald-300" />
                        </div>
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                                Total recaudado
                            </div>
                            <div className="mt-0.5 text-xl font-semibold text-[#06B6D4] tabular-nums">
                                {money.format(summary?.totals.recaudado ?? 0)}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-white/60">
                        Rango:{' '}
                        {summary
                            ? `${new Date(summary.range.from).toLocaleDateString()} – ${new Date(
                                summary.range.to,
                            ).toLocaleDateString()}`
                            : '—'}
                    </div>
                </div>

                {/* Card 2: ventas general */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-cyan-300" />
                        </div>
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                                Ventas (general)
                            </div>
                            <div className="text-lg font-semibold tabular-nums">
                                {summary?.totals.ventas_total ?? 0} ventas
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl px-3 py-2 bg-emerald-400/10 border border-emerald-400/20 flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                                <span>Vendidas</span>
                                <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                            </div>
                            <div className="font-semibold tabular-nums">
                                {summary?.totals.vendidas ?? 0}
                            </div>
                        </div>
                        <div className="rounded-xl px-3 py-2 bg-emerald-400/10 border border-emerald-400/20 flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                                <span>Entregadas</span>
                                <Truck className="h-3 w-3 text-emerald-300" />
                            </div>
                            <div className="font-semibold tabular-nums">
                                {summary?.totals.entregado ?? 0}
                            </div>
                        </div>
                        <div className="rounded-xl px-3 py-2 bg-amber-400/10 border border-amber-400/20 flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                                <span>Por entregar</span>
                                <Package className="h-3 w-3 text-amber-300" />
                            </div>
                            <div className="font-semibold tabular-nums">
                                {summary?.totals.por_entregar ?? 0}
                            </div>
                        </div>
                        <div className="rounded-xl px-3 py-2 bg-rose-400/10 border border-rose-400/20 flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-white/70">
                                <span>Anuladas</span>
                                <Ban className="h-3 w-3 text-rose-300" />
                            </div>
                            <div className="font-semibold tabular-nums">
                                {summary?.totals.anuladas ?? 0}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-white/60 mt-2">
                        Ítems vendidos:{' '}
                        <span className="font-semibold">
                            {summary?.totals.items_sold ?? 0}
                        </span>
                    </div>
                </div>

                {/* Card 3: resumen productos */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-400/40 flex items-center justify-center">
                            <PackageOpen className="h-4 w-4 text-violet-300" />
                        </div>
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                                Resumen de productos
                            </div>
                            <div className="text-sm text-white/80">
                                Distintos:{' '}
                                <span className="font-semibold">
                                    {summary?.products.distinct ?? 0}
                                </span>{' '}
                                · Cantidad total:{' '}
                                <span className="font-semibold">
                                    {summary?.products.total_qty ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 -mx-2 pr-2 max-h-80 overflow-y-auto scrollbar-thin">
                        <ul className="space-y-2">
                            {(summary?.products.top ?? []).map((t) => (
                                <li
                                    key={t.product.id}
                                    className="flex items-center gap-3 rounded-xl px-2 py-2 bg-white/[0.03]
                           hover:bg-white/[0.06] border border-white/10"
                                >
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
                                        <img
                                            src={t.product.image_url || '/img/placeholder.jfif'}
                                            alt={t.product.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '';
                                            }}
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-sm">
                                            {t.product.name}
                                        </div>
                                        {t.product.sku && (
                                            <div className="text-white/45 text-[11px] flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                <span className="truncate">{t.product.sku}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="tabular-nums text-white/80 text-sm">
                                            ×{t.qty}
                                        </div>
                                        <div className="tabular-nums font-semibold text-xs">
                                            {money.format(t.revenue)}
                                        </div>
                                    </div>
                                </li>
                            ))}

                            {(!summary?.products.top ||
                                summary.products.top.length === 0) && (
                                    <li className="text-white/60 text-sm px-2 py-3">Sin datos.</li>
                                )}
                        </ul>
                    </div>
                </div>
            </section>

            {/* TABLA PRINCIPAL */}
            {loading ? (
                <p className="text-white/70">Cargando…</p>
            ) : (
                <>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] text-white">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.03] text-white/70">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Fecha</th>
                                    <th className="p-3 text-left font-semibold">Cliente</th>
                                    <th className="p-3 text-center font-semibold">Ítems</th>
                                    <th className="p-3 text-center font-semibold">Total</th>
                                    <th className="p-3 text-center font-semibold">Estado</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {data.data.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-white/[0.035] transition-colors"
                                    >
                                        {/* FECHA */}
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                                <CalendarRange className="h-3.5 w-3.5 text-white/60" />
                                                <span>
                                                    {s.created_at
                                                        ? new Date(s.created_at).toLocaleString('es-BO')
                                                        : '—'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* CLIENTE */}
                                        <td className="py-3 px-3">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 shrink-0">
                                                    <UserCircle2 className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {s.customer?.name ?? '—'}
                                                    </div>
                                                    <div className="text-white/50 text-[11px] leading-snug space-y-0.5">
                                                        {s.customer?.ci && <div>CI: {s.customer.ci}</div>}
                                                        {s.customer?.email && (
                                                            <div className="truncate flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate">
                                                                    {s.customer.email}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ÍTEMS */}
                                        <td className="py-3 px-2 text-center tabular-nums">
                                            {s.items_qty ?? '—'}
                                        </td>

                                        {/* TOTAL */}
                                        <td className="py-3 px-2 text-center tabular-nums">
                                            {money.format(s.total ?? 0)}
                                        </td>

                                        {/* ESTADOS */}
                                        <td className="py-3 px-2 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {paidBadge(s)}
                                                {deliveryBadge(s)}
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="p-3">
                                            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
                                                <Link
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                   border border-white/15 bg-white/[0.06]
                                   hover:bg-white/10"
                                                    to={`/admin/sales/${s.id}`}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Ver</span>
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => onReceipt(s.id)}
                                                    disabled={
                                                        rowBusyId === s.id && rowBusyAction === 'receipt'
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px]
                          ${rowBusyId === s.id &&
                                                            rowBusyAction === 'receipt'
                                                            ? 'border-white/15 bg-white/10 text-white/60'
                                                            : 'border-white/15 bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white hover:brightness-110'
                                                        }`}
                                                    title="Descargar recibo (PDF)"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    <span>
                                                        {rowBusyId === s.id &&
                                                            rowBusyAction === 'receipt'
                                                            ? 'PDF…'
                                                            : 'Recibo'}
                                                    </span>
                                                </button>

                                                {(!s.is_canceled &&
                                                    s.status === 'paid' &&
                                                    s.delivery_status === 'to_deliver') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeliveryModal(s)}
                                                            disabled={rowBusyId === s.id && rowBusyAction === 'deliver'}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                                            border border-emerald-400/20 bg-emerald-500/10
                                                            hover:bg-emerald-500/20"
                                                            title="Registrar entrega"
                                                        >
                                                            <CheckSquare className="h-3.5 w-3.5" />
                                                            <span>
                                                                {rowBusyId === s.id &&
                                                                    rowBusyAction === 'deliver'
                                                                    ? 'Entregando…'
                                                                    : 'Entregar'}
                                                            </span>
                                                        </button>
                                                    )}


                                                {s.delivery_status === 'delivered' && !s.is_canceled && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDownloadNote(s)}
                                                        disabled={
                                                            rowBusyId === s.id && rowBusyAction === 'note'
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                     border border-cyan-400/20 bg-cyan-500/10 text-cyan-300
                                     hover:bg-cyan-500/20"
                                                        title="Descargar nota de entrega (PDF)"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>
                                                            {rowBusyId === s.id && rowBusyAction === 'note'
                                                                ? 'Descargando…'
                                                                : 'Nota entrega'}
                                                        </span>
                                                    </button>
                                                )}

                                                {!s.is_canceled && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onVoidSale(s)}
                                                        disabled={
                                                            rowBusyId === s.id && rowBusyAction === 'void'
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                     border border-rose-400/20 bg-rose-500/10
                                     hover:bg-rose-500/20"
                                                        title="Anular venta (devuelve stock)"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        <span>
                                                            {rowBusyId === s.id && rowBusyAction === 'void'
                                                                ? 'Anulando…'
                                                                : 'Anular'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {data.data.length === 0 && (
                                    <tr>
                                        <td
                                            className="py-6 text-center text-white/70"
                                            colSpan={7}
                                        >
                                            Sin resultados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                        <div>
                            {data.total > 0 ? (
                                <>
                                    Mostrando{' '}
                                    <span className="text-white font-medium">{from}</span>
                                    –
                                    <span className="text-white font-medium">{to}</span> de{' '}
                                    <span className="text-white font-medium">{data.total}</span>
                                </>
                            ) : (
                                'Sin resultados'
                            )}
                            <span className="ml-3 text-white/50">
                                Página {data.current_page} de {data.last_page}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={!canPrev}
                                onClick={() => setPage(1)}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canPrev
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <ChevronsLeft className="h-3 w-3" />
                                <span>Primero</span>
                            </button>
                            <button
                                disabled={!canPrev}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canPrev
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <ChevronLeft className="h-3 w-3" />
                                <span>Anterior</span>
                            </button>
                            <button
                                disabled={!canNext}
                                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canNext
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <span>Siguiente</span>
                                <ChevronRight className="h-3 w-3" />
                            </button>
                            <button
                                disabled={!canNext}
                                onClick={() => setPage(data.last_page)}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.04] inline-flex items-center gap-1
                          ${canNext
                                        ? 'hover:bg-white/10'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <span>Última</span>
                                <ChevronsRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </>
            )}
            <Modal
                open={!!deliverySale}
                onClose={() => {
                    if (deliverySubmitting) return; // no cerrar si está enviando
                    setDeliverySale(null);
                    setDeliveryCi('');
                    setDeliveryNotes('');
                    setDeliveryError(null);
                }}
                title="Confirmar entrega de venta"
                maxWidthClass="max-w-xl"
            >
                {deliverySale && (
                    <div className="space-y-4 text-sm">

                        {/* Resumen de la venta */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">
                                Resumen de venta
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <UserCircle2 className="h-4 w-4 text-white/50" />
                                        <span className="font-medium">
                                            {deliverySale.customer?.name ?? 'Cliente sin nombre'}
                                        </span>
                                    </div>
                                    <div className="text-white/60">
                                        CI cliente:{' '}
                                        <span className="font-mono">
                                            {deliverySale.customer?.ci ?? '—'}
                                        </span>
                                    </div>
                                    {deliverySale.customer?.email && (
                                        <div className="flex items-center gap-1 text-white/60">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">
                                                {deliverySale.customer.email}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="text-white/60">Total</div>
                                    <div className="text-lg font-semibold">
                                        {money.format(deliverySale.total)}
                                    </div>
                                    <div className="text-white/60">
                                        {(deliverySale.items_qty ??
                                            deliverySale.details?.length ??
                                            0)}{' '}
                                        ítems
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Campo CI */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-white/70">
                                CI de quien recoge <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={deliveryCi}
                                onChange={e => setDeliveryCi(e.target.value)}
                                placeholder="Ej: 12345678"
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm
                                   placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                            />
                            <p className="text-[11px] text-white/50">
                                Debe coincidir con el CI registrado del cliente para poder marcar la venta como entregada.
                            </p>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-white/70">
                                Observaciones (opcional)
                            </label>
                            <textarea
                                rows={3}
                                value={deliveryNotes}
                                onChange={e => setDeliveryNotes(e.target.value)}
                                placeholder="Ej: Retira su hermano, revisa productos y firma conforme."
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm
                                   placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60 resize-none"
                            />
                        </div>

                        {/* Error */}
                        {deliveryError && (
                            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                                {deliveryError}
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (deliverySubmitting) return;
                                    setDeliverySale(null);
                                    setDeliveryCi('');
                                    setDeliveryNotes('');
                                    setDeliveryError(null);
                                }}
                                className="px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelivery}
                                disabled={deliverySubmitting}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                                   bg-emerald-500 hover:bg-emerald-600 text-black font-semibold
                                   disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {deliverySubmitting ? (
                                    <>
                                        <Clock4 className="h-3.5 w-3.5" />
                                        <span>Confirmando…</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckSquare className="h-3.5 w-3.5" />
                                        <span>Confirmar entrega</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
