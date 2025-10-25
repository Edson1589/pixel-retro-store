import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminListSales, adminGetSalesSummary, adminExportSalesReport } from '../../../services/adminApi';
import type { Page } from '../../../services/adminApi';
import type { Sale, SalesSummary } from '../../../types';
import { adminDownloadReceipt } from '../../../services/adminApi';

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

    const [dlId, setDlId] = useState<number | null>(null);

    const onReceipt = async (id: number) => {
        setDlId(id);
        try { await adminDownloadReceipt(id); }
        catch (e) { alert(e instanceof Error ? e.message : 'No se pudo descargar el recibo'); }
        finally { setDlId(null); }
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

    const statusPill = (st: Sale['status']) => {
        const map: Record<Sale['status'], string> = {
            paid: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
            pending: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
            failed: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
        };
        return `inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${map[st]}`;
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
        } finally { setDownloadingPdf(false); }
    };

    return (
        <div className="space-y-5">

            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
           bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                    Ventas
                </h2>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <input
                        className="h-9 w-56 rounded-xl px-3 bg-white/[0.06] text-white/90 placeholder:text-white/45
                       border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        placeholder="Buscar por cliente, email, ref, ID…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <input
                        type="date"
                        value={draftDateFrom}
                        onChange={(e) => setDraftDateFrom(e.target.value)}
                        className="h-9 rounded-xl px-3 bg-white/[0.06] text-white/90 border border-white/10"
                    />
                    <span className="text-white/50 text-sm">→</span>
                    <input
                        type="date"
                        value={draftDateTo}
                        onChange={(e) => setDraftDateTo(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') applyDateFilter(); }}
                        className="h-9 rounded-xl px-3 bg-white/[0.06] text-white/90 border border-white/10"
                    />

                    <button
                        type="button"
                        onClick={applyDateFilter}
                        className="h-9 px-3 rounded-xl text-white font-medium
             bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110
             shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]"
                        title="Aplicar filtro de fechas"
                    >
                        Buscar
                    </button>

                    <button
                        type="button"
                        onClick={clearDateFilter}
                        className="h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10"
                        title="Limpiar fechas"
                    >
                        Limpiar
                    </button>

                    <button
                        type="button"
                        onClick={onExportPdf}
                        disabled={downloadingPdf}
                        className="h-9 px-3 rounded-xl text-white font-medium bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110 shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]"
                        title="Descargar PDF"
                    >
                        {downloadingPdf ? 'Generando…' : 'Descargar PDF'}
                    </button>
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-sm text-white/70">Total dinero recaudado</div>
                    <div className="mt-1 text-3xl font-extrabold text-[#06B6D4] tabular-nums">
                        {money.format(summary?.totals.recaudado ?? 0)}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                        Rango: {summary ? new Date(summary.range.from).toLocaleDateString() : '—'} – {summary ? new Date(summary.range.to).toLocaleDateString() : '—'}
                    </div>
                </div>

                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-sm text-white/70">Ventas (general)</div>
                    <div className="mt-1 text-xl font-bold tabular-nums">{summary?.totals.ventas_total ?? 0} ventas</div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-xl px-3 py-2 bg-emerald-400/10 border border-emerald-400/20">
                            <div className="text-white/70 text-xs">Pagadas</div>
                            <div className="font-semibold tabular-nums">{summary?.totals.paid.count ?? 0}</div>
                        </div>
                        <div className="rounded-xl px-3 py-2 bg-amber-400/10 border border-amber-400/20">
                            <div className="text-white/70 text-xs">Pendientes</div>
                            <div className="font-semibold tabular-nums">{summary?.totals.pending.count ?? 0}</div>
                        </div>
                        <div className="rounded-xl px-3 py-2 bg-rose-400/10 border border-rose-400/20">
                            <div className="text-white/70 text-xs">Fallidas</div>
                            <div className="font-semibold tabular-nums">{summary?.totals.failed.count ?? 0}</div>
                        </div>
                    </div>
                    <div className="text-xs text-white/60 mt-2">
                        Ítems vendidos: <span className="font-semibold">{summary?.totals.items_sold ?? 0}</span>
                    </div>
                </div>

                <div className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10">
                    <div className="text-sm text-white/70">Resumen de productos</div>

                    <div className="mt-1 text-sm text-white/80">
                        Distintos: <span className="font-semibold">{summary?.products.distinct ?? 0}</span>
                        {' '}· Cantidad total: <span className="font-semibold">{summary?.products.total_qty ?? 0}</span>
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
                                            onError={(e) => { e.currentTarget.src = ''; }}
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium">{t.product.name}</div>
                                        {t.product.sku && (
                                            <div className="text-white/45 text-xs">{t.product.sku}</div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="tabular-nums text-white/80">×{t.qty}</div>
                                        <div className="tabular-nums font-semibold">{money.format(t.revenue)}</div>
                                    </div>
                                </li>
                            ))}

                            {(!summary?.products.top || summary.products.top.length === 0) && (
                                <li className="text-white/60 text-sm px-2 py-3">Sin datos.</li>
                            )}
                        </ul>
                    </div>
                </div>

            </section>

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
                                {data.data.map(s => (
                                    <tr key={s.id} className="hover:bg-white/[0.035]">
                                        <td className="py-3 px-3">{s.created_at ? new Date(s.created_at).toLocaleString('es-BO') : '—'}</td>
                                        <td className="py-3 px-3">
                                            <div className="truncate">
                                                {s.customer?.name ?? '—'}
                                                <div className="text-white/50 text-xs">{s.customer?.email ?? ''}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-center">{s.items_qty ?? '—'}</td>
                                        <td className="py-3 px-2 text-center">{money.format(s.total ?? 0)}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={statusPill(s.status)}>{s.status.toUpperCase()}</span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2 text-[13px]">
                                                <Link className="text-cyan-300 hover:underline" to={`/admin/sales/${s.id}`}>Ver</Link>
                                                <span className="text-white/20">•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => onReceipt(s.id)}
                                                    disabled={dlId === s.id}
                                                    className={`px-2 py-1 rounded-md border border-white/10
                  ${dlId === s.id ? 'bg-white/10 text-white/60' :
                                                            'bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] text-white hover:brightness-110'}
                 `}
                                                    title="Descargar recibo (PDF)"
                                                >
                                                    {dlId === s.id ? 'PDF…' : 'Recibo'}
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                                {data.data.length === 0 && (
                                    <tr><td className="py-6 text-center text-white/70" colSpan={7}>Sin resultados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        <div className="text-white/70 text-sm">
                            {data.total > 0
                                ? <>Mostrando <span className="text-white">{from}</span>–<span className="text-white">{to}</span> de <span className="text-white">{data.total}</span></>
                                : 'Sin resultados'}
                            <span className="ml-3 text-white/50">Página {data.current_page} de {data.last_page}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setPage(1)} disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                  ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`} title="Primera página">« Primero</button>
                            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                  ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`} title="Anterior">‹ Anterior</button>
                            <button type="button" onClick={() => setPage(p => Math.min(data.last_page, p + 1))} disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                  ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`} title="Siguiente">Siguiente ›</button>
                            <button type="button" onClick={() => setPage(data.last_page)} disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                  ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`} title="Última página">Última »</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
