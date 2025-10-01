import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../../../services/adminApi';
import { Link } from 'react-router-dom';
import type { Product } from '../../../types';
import type { Page } from '../../../services/adminApi'; // <-- NUEVO

type StatusFilter = 'all' | 'active' | 'inactive';

const toNumber = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

type MaybeStatus = { status?: unknown };

const isActive = (p: Product): boolean => {
    const raw = (p as unknown as MaybeStatus).status;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') return /act/i.test(raw) && !/inact/i.test(raw);
    if (typeof raw === 'number') return raw === 1;
    return false;
};

export default function AdminProductsList() {
    // 🔁 Ahora guardamos la estructura de paginación completa
    const [data, setData] = useState<Page<Product>>({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    // UI local
    const [q, setQ] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');

    // 📄 Controles de paginación (nuevo)
    const [page, setPage] = useState(1);
    const [perPage] = useState(15);

    const load = async () => {
        setLoading(true);
        try {
            // 👇 Solo integramos paginación; el filtrado/búsqueda siguen siendo locales
            const r = await listProducts({ page, perPage });
            setData(r);
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial y cuando cambian page/perPage
    useEffect(() => { void load(); }, [page, perPage]);

    // Al cambiar búsqueda/estado, volvemos a la primera página (no toca server)
    useEffect(() => { setPage(1); }, [q, status]);

    // métricas (se calculan sobre la página actual, como antes)
    const metrics = useMemo(() => {
        const items = data.data;
        const total = items.length;
        const stockTotal = items.reduce((a, b) => a + toNumber((b as { stock?: unknown }).stock), 0);
        const act = items.filter(isActive).length;
        const inact = total - act;
        return { total, stockTotal, act, inact };
    }, [data]);

    // filtrado + búsqueda (local sobre la página actual)
    const filtered = useMemo(() => {
        const qn = q.trim().toLowerCase();
        return data.data.filter((p) => {
            const okStatus =
                status === 'all' ? true : status === 'active' ? isActive(p) : !isActive(p);
            const name = String((p as { name?: unknown }).name ?? '').toLowerCase();
            return okStatus && (qn ? name.includes(qn) : true);
        });
    }, [data, q, status]);

    const canPrev = data.current_page > 1;
    const canNext = data.current_page < data.last_page;

    const from = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const to = Math.min(data.current_page * data.per_page, data.total);

    return (
        <div className="space-y-5">
            {/* MÉTRICAS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Productos', value: metrics.total },
                    { label: 'Stock Total', value: metrics.stockTotal },
                    { label: 'Activos', value: metrics.act },
                    { label: 'Inactivos', value: metrics.inact },
                ].map((m) => (
                    <div
                        key={m.label}
                        className="rounded-2xl p-4 text-white bg-white/[0.05] border border-white/10
                       shadow-[0_20px_40px_-24px_rgba(124,58,237,0.25)]"
                    >
                        <div className="text-sm text-white/70">{m.label}</div>
                        <div className="mt-1 text-2xl font-bold text-[#06B6D4]">{m.value}</div>
                    </div>
                ))}
            </section>

            {/* TÍTULO + CONTROLES */}
            <div className="flex flex-wrap items-center gap-2">
                <h2
                    className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]"
                >
                    Productos
                </h2>

                <div className="ml-auto flex items-center gap-2">
                    <input
                        className="h-9 w-56 rounded-xl px-3
                       bg-white/[0.06] text-white/90 placeholder:text-white/45
                       border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        placeholder="Buscar producto..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    {/* Filtro de estado (local) */}
                    <div className="p-1 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-1">
                        {(['all', 'active', 'inactive'] as const).map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setStatus(v)}
                                className={`px-3 h-7 rounded-xl text-xs uppercase tracking-wide transition
                        ${status === v
                                        ? 'bg-[#0b1224] text-white shadow-[0_4px_18px_-6px_rgba(99,102,241,0.5)]'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                {v === 'all' ? 'Todos' : v === 'active' ? 'Activos' : 'Inactivos'}
                            </button>
                        ))}
                    </div>

                    <Link
                        to="/admin/products/new"
                        className="h-9 px-3 rounded-xl text-white font-medium
             bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)] hover:brightness-110
             shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]
             inline-flex items-center justify-center"
                    >
                        Nuevo Producto
                    </Link>

                </div>
            </div>

            {/* TABLA */}
            {loading ? (
                <p className="text-white/70">Cargando…</p>
            ) : (
                <>
                    <div className="rounded-2xl overflow-hidden border border-white/10
                        bg-white/[0.04] text-white">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.03] text-white/70">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Nombre</th>
                                    <th className="p-3 px-2 text-center font-semibold">Precio</th>
                                    <th className="p-3 px-2 text-center font-semibold">Stock</th>
                                    <th className="p-3 px-2 text-center font-semibold">Estado</th>
                                    <th className="p-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filtered.map((p) => {
                                    const price = toNumber((p as { price?: unknown }).price);
                                    const stock = toNumber((p as { stock?: unknown }).stock);
                                    const active = isActive(p);
                                    return (
                                        <tr key={p.id} className="hover:bg-white/[0.035]">
                                            <td className="py-3 px-2">{(p as { name?: string }).name ?? '—'}</td>
                                            <td className="py-3 px-2 text-center">Bs. {price.toFixed(2)}</td>
                                            <td className="py-3 px-2 text-center">
                                                <span
                                                    className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md text-[11px] border
                          ${stock > 0
                                                            ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                                                            : 'bg-rose-400/10 text-rose-300 border-rose-400/20'}`}
                                                >
                                                    {stock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border
                          ${active
                                                            ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                                                            : 'bg-rose-400/10 text-rose-300 border-rose-400/20'}`}
                                                >
                                                    {active ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2 text-[13px]">
                                                    <Link
                                                        className="text-cyan-300 hover:underline"
                                                        to={`/admin/products/${p.id}`}
                                                    >
                                                        Ver
                                                    </Link>
                                                    <span className="text-white/20">•</span>
                                                    <Link
                                                        className="text-cyan-300 hover:underline"
                                                        to={`/admin/products/${p.id}/edit`}
                                                    >
                                                        Editar
                                                    </Link>
                                                    <span className="text-white/20">•</span>
                                                    <Link
                                                        className="text-rose-300 hover:underline"
                                                        to={`/admin/products/${p.id}/delete`}
                                                    >
                                                        Eliminar
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td className="py-6 text-center text-white/70" colSpan={6}>
                                            No se encontraron productos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* CONTROLES DE PÁGINA */}
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        <div className="text-white/70 text-sm">
                            {data.total > 0
                                ? <>Mostrando <span className="text-white">{from}</span>–<span className="text-white">{to}</span> de <span className="text-white">{data.total}</span></>
                                : 'Sin resultados'}
                            <span className="ml-3 text-white/50">Página {data.current_page} de {data.last_page}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage(1)}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Primera página"
                            >
                                « Primero
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!canPrev}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canPrev ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Anterior"
                            >
                                ‹ Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Siguiente"
                            >
                                Siguiente ›
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage(data.last_page)}
                                disabled={!canNext}
                                className={`h-9 px-3 rounded-xl border border-white/10 bg-white/[0.06] text-white/80
                                    ${canNext ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
                                title="Última página"
                            >
                                Última »
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
