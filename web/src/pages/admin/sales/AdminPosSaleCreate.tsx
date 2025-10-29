import { useMemo, useState } from 'react';
import {
    adminPosSearchProducts,
    adminPosSearchCustomers,
    adminPosCreateSale,
    adminDownloadReceipt,
    type PosProduct,
    type PosCustomer,
    type PosSalePayload,
    type PosCreatedSale,
} from '../../../services/adminApi';

type CartLine = {
    product_id: number;
    name: string;
    sku?: string | null;
    image_url?: string | null;
    stock: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

export default function AdminPosSaleCreate() {

    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<PosCustomer[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);

    const [custName, setCustName] = useState('');
    const [custEmail, setCustEmail] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custAddress, setCustAddress] = useState('');
    const [custCi, setCustCi] = useState('');

    const [productQuery, setProductQuery] = useState('');
    const [productResults, setProductResults] = useState<PosProduct[]>([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    const [lines, setLines] = useState<CartLine[]>([]);

    const [loadingCustSearch, setLoadingCustSearch] = useState(false);
    const [loadingProdSearch, setLoadingProdSearch] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<PosSalePayload | null>(null);

    const [receiptOpen, setReceiptOpen] = useState(false);
    const [lastSale, setLastSale] = useState<PosCreatedSale['data'] | null>(null);


    const todayStr = useMemo(() => {
        const d = new Date();
        return d.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }, []);

    const total = useMemo(() => {
        return lines.reduce((acc, l) => acc + l.subtotal, 0);
    }, [lines]);

    const pickCustomer = (c: PosCustomer) => {
        setSelectedCustomer(c);
        setCustomerQuery(`${c.name} (${c.email})`);
        setShowCustomerDropdown(false);

        setCustName(c.name ?? '');
        setCustEmail(c.email ?? '');
        setCustPhone(c.phone ?? '');
        setCustAddress(c.address ?? '');
        setCustCi(c.ci ?? '');
    };

    const clearCustomer = () => {
        setSelectedCustomer(null);
        setCustomerQuery('');
        setCustName('');
        setCustEmail('');
        setCustPhone('');
        setCustAddress('');
        setCustCi('');
    };

    const handleSearchCustomer = async () => {
        const q = customerQuery.trim();
        if (!q) {
            setCustomerResults([]);
            setShowCustomerDropdown(false);
            return;
        }

        try {
            setLoadingCustSearch(true);
            const res = await adminPosSearchCustomers(q);
            setCustomerResults(res);
            setShowCustomerDropdown(true);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error buscando cliente');
        } finally {
            setLoadingCustSearch(false);
        }
    };


    const handleSearchProduct = async () => {
        const q = productQuery.trim();
        if (!q) {
            setProductResults([]);
            setShowProductDropdown(false);
            return;
        }

        try {
            setLoadingProdSearch(true);
            const res = await adminPosSearchProducts(q);
            setProductResults(res);
            setShowProductDropdown(true);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Error buscando producto');
        } finally {
            setLoadingProdSearch(false);
        }
    };

    const addProductToCart = (p: PosProduct) => {
        setShowProductDropdown(false);
        setProductQuery('');

        const idx = lines.findIndex(l => l.product_id === p.id);

        if (idx >= 0 && !p.is_unique) {
            setLines(prev => {
                const clone = [...prev];
                const line = clone[idx];

                let newQty = line.quantity + 1;

                if (newQty > line.stock) {
                    newQty = line.stock;
                }

                clone[idx] = {
                    ...line,
                    quantity: newQty,
                    subtotal: newQty * line.unit_price,
                };
                return clone;
            });
            return;
        }

        const startQty = p.stock > 0 ? 1 : 0;

        if (p.stock <= 0) {
            setErrorMsg(`Sin stock para ${p.name}`);
            return;
        }

        const newLine: CartLine = {
            product_id: p.id,
            name: p.name,
            sku: p.sku ?? null,
            image_url: p.image_url ?? null,
            stock: p.stock,
            quantity: startQty,
            unit_price: Number(p.price),
            subtotal: Number(p.price) * startQty,
        };

        setLines(prev => [...prev, newLine]);
    };

    const updateQty = (productId: number, qtyRaw: string | number) => {
        setLines(prev => prev.map(l => {
            if (l.product_id !== productId) return l;

            const req = Number(qtyRaw);

            let safeQty = Number.isFinite(req) ? req : 1;
            if (safeQty < 1) safeQty = 1;

            if (safeQty > l.stock) safeQty = l.stock;

            return {
                ...l,
                quantity: safeQty,
                subtotal: safeQty * l.unit_price,
            };
        }));
    };

    const removeLine = (productId: number) => {
        setLines(prev => prev.filter(l => l.product_id !== productId));
    };

    const handleAskConfirm = async () => {
        if (lines.length === 0) {
            setErrorMsg('Agrega al menos 1 producto.');
            return;
        }

        const nameToSend = custName.trim();
        const emailToSend = custEmail.trim();
        const phoneToSend = (custPhone || '').trim();
        const addrToSend = (custAddress || '').trim();

        if (!nameToSend || !emailToSend) {
            setErrorMsg(
                'Debes ingresar Nombre y Email del cliente (o seleccionar un cliente existente).'
            );
            return;
        }

        const payload: PosSalePayload = {
            customer: {
                name: nameToSend,
                ci: custCi || undefined,
                email: emailToSend,
                phone: phoneToSend || undefined,
                address: addrToSend || undefined,
            },
            items: lines.map(l => ({
                product_id: l.product_id,
                quantity: l.quantity,
                unit_price: l.unit_price,
            })),
        };

        if (selectedCustomer) {
            payload.customer_id = selectedCustomer.id;
        }

        setPendingPayload(payload);
        setConfirmOpen(true);
        setErrorMsg(null);
    };



    const confirmSaveSale = async () => {
        if (!pendingPayload) return;

        try {
            setSaving(true);
            setErrorMsg(null);
            setSuccessMsg(null);

            const created = await adminPosCreateSale(pendingPayload);

            setSuccessMsg(`Venta #${created.data.id} creada. Ref: ${created.data.payment_ref ?? '—'}`);

            setLastSale(created.data);
            setReceiptOpen(true);

            setLines([]);

        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Error al guardar venta');
        } finally {
            setSaving(false);
            setConfirmOpen(false);
            setPendingPayload(null);
        }
    };


    return (
        <div className="space-y-6 text-white">
            <section
                className="rounded-[20px] px-6 py-5 bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                           text-white border border-white/10 shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="text-center sm:text-left text-xl font-extrabold tracking-wider">
                            REGISTRO DE VENTA
                        </div>
                        <div className="text-sm text-white/90">
                            Fecha: <span className="font-medium">{todayStr}</span>
                        </div>
                    </div>
                    <div className="text-sm text-white/80">
                        Total actual:{' '}
                        <span className="text-white font-bold">
                            {money.format(total)}
                        </span>
                    </div>
                </div>
            </section>

            {errorMsg && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-rose-300 text-sm">
                    {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-emerald-300 text-sm">
                    {successMsg}
                </div>
            )}

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <h2 className="text-white/90 font-semibold text-lg mb-3 tracking-wide">
                    Cliente
                </h2>

                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-white/60 block mb-1">
                            Buscar cliente (CI/NIT, nombre, email, teléfono)
                        </label>

                        <div className="relative">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 h-10 rounded-xl bg-white/[0.07] border border-white/10
                           px-3 text-white placeholder:text-white/40
                           focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    placeholder="Ej: juan@correo.com"
                                    value={customerQuery}
                                    onChange={(e) => {
                                        setCustomerQuery(e.target.value);
                                        setShowCustomerDropdown(false);
                                    }}
                                    onFocus={() => {
                                        if (customerResults.length > 0) setShowCustomerDropdown(true);
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={handleSearchCustomer}
                                    className="px-3 h-10 rounded-xl bg-white/[0.08] border border-white/10
                           text-white text-sm font-medium hover:bg-white/15
                           disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loadingCustSearch}
                                >
                                    {loadingCustSearch ? '...' : 'Buscar'}
                                </button>
                            </div>

                            {showCustomerDropdown && customerResults.length > 0 && (
                                <div
                                    className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto
                           rounded-xl border border-white/10 bg-[#0b1224] shadow-xl
                           text-sm scrollbar-thin"
                                >
                                    {customerResults.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => pickCustomer(c)}
                                            className="w-full text-left px-3 py-2 hover:bg-white/10"
                                        >
                                            <div className="text-white/90 font-medium truncate">{c.name}</div>
                                            <div className="text-white/50 text-[11px] truncate">
                                                {c.email} {c.phone ? `• ${c.phone}` : ''} {c.ci ? `• CI ${c.ci}` : ''}
                                            </div>

                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            {selectedCustomer ? (
                                <>
                                    <span className="text-xs text-emerald-300">
                                        Cliente seleccionado (ID {selectedCustomer.id})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearCustomer}
                                        className="text-[11px] text-rose-300 hover:underline"
                                    >
                                        Limpiar
                                    </button>
                                </>
                            ) : (
                                <span className="text-xs text-white/50">
                                    No seleccionado. Se creará cliente nuevo.
                                </span>
                            )}
                        </div>
                    </div>


                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/60 block mb-1">Nombre / Razón Social</label>
                            <input
                                className="w-full h-10 rounded-xl bg-white/[0.07] border border-white/10 px-3
            text-white placeholder:text-white/40 focus:outline-none
            focus:ring-2 focus:ring-[#7C3AED66]
            disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="Juan Pérez"
                                value={custName}
                                onChange={(e) => setCustName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 block mb-1">CI</label>
                            <input
                                className="w-full h-10 rounded-xl bg-white/[0.07] border border-white/10 px-3
            text-white placeholder:text-white/40 focus:outline-none
            focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="12345678 LP"
                                value={custCi}
                                onChange={(e) => setCustCi(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 block mb-1">Email</label>
                            <input
                                className="w-full h-10 rounded-xl bg-white/[0.07] border border-white/10 px-3
            text-white placeholder:text-white/40 focus:outline-none
            focus:ring-2 focus:ring-[#7C3AED66]
            disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="juan@correo.com"
                                value={custEmail}
                                onChange={(e) => setCustEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 block mb-1">Teléfono</label>
                            <input
                                className="w-full h-10 rounded-xl bg-white/[0.07] border border-white/10 px-3
            text-white placeholder:text-white/40 focus:outline-none
            focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="777-123"
                                value={custPhone}
                                onChange={(e) => setCustPhone(e.target.value)}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-xs text-white/60 block mb-1">Dirección</label>
                            <input
                                className="w-full h-10 rounded-xl bg-white/[0.07] border border-white/10 px-3
            text-white placeholder:text-white/40 focus:outline-none
            focus:ring-2 focus:ring-[#7C3AED66]"
                                placeholder="Av. Siempre Viva 123"
                                value={custAddress}
                                onChange={(e) => setCustAddress(e.target.value)}
                            />
                        </div>
                    </div>


                </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-white/60 block mb-1">
                            Producto a agregar (buscar por nombre o SKU)
                        </label>

                        <div className="relative">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 h-10 rounded-xl bg-white/[0.07] border border-white/10
                           px-3 text-white placeholder:text-white/40
                           focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                    placeholder="Nintendo, Sega, PRD-0012..."
                                    value={productQuery}
                                    onChange={(e) => {
                                        setProductQuery(e.target.value);
                                        setShowProductDropdown(false);
                                    }}
                                    onFocus={() => {
                                        if (productResults.length > 0) setShowProductDropdown(true);
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={handleSearchProduct}
                                    className="px-3 h-10 rounded-xl bg-white/[0.08] border border-white/10
                           text-white text-sm font-medium hover:bg-white/15
                           disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loadingProdSearch}
                                >
                                    {loadingProdSearch ? '...' : 'Buscar'}
                                </button>
                            </div>

                            {showProductDropdown && productResults.length > 0 && (
                                <div
                                    className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto
                           rounded-xl border border-white/10 bg-[#0b1224] shadow-xl
                           text-sm scrollbar-thin"
                                >
                                    {productResults.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => addProductToCart(p)}
                                            className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-start gap-3"
                                        >
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.07] text-[10px] text-white/60 grid place-items-center">
                                                {p.image_url ? (
                                                    <img
                                                        src={p.image_url}
                                                        alt={p.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>IMG</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-white/90 font-medium truncate">{p.name}</div>
                                                <div className="text-white/50 text-[11px] truncate">
                                                    SKU: {p.sku ?? '—'} · Stock: {p.stock} · {money.format(p.price)}
                                                    {p.is_unique ? ' · ÚNICO' : ''}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] text-white">
                    <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] text-white/70">
                            <tr>
                                <th className="p-3 text-left font-semibold w-[80px]">Cantidad</th>
                                <th className="p-3 text-left font-semibold">Descripción</th>
                                <th className="p-3 text-center font-semibold w-[110px]">P. Unit Bs.</th>
                                <th className="p-3 text-center font-semibold w-[110px]">Importe Bs.</th>
                                <th className="p-3 text-center font-semibold w-[70px]">Opción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {lines.map((l) => (
                                <tr key={l.product_id} className="hover:bg-white/[0.035] align-top">
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            min={1}
                                            max={l.stock}
                                            className="w-20 h-9 rounded-lg bg-white/[0.07] border border-white/10
                                                       text-white text-center text-sm
                                                       focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                                            value={l.quantity}
                                            disabled={l.stock <= 0}
                                            onChange={(e) => updateQty(l.product_id, e.target.value)}
                                        />
                                    </td>

                                    <td className="p-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.07] text-[10px] text-white/60 grid place-items-center">
                                                {l.image_url ? (
                                                    <img
                                                        src={l.image_url}
                                                        alt={l.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>IMG</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-white/90 truncate">{l.name}</div>

                                                <div className="text-[11px] text-white/50 truncate">
                                                    {l.sku || '—'}
                                                </div>

                                                <div className="text-[11px] mt-0.5">
                                                    <span className={l.stock > 0 ? 'text-emerald-300' : 'text-rose-300'}>
                                                        Stock disp.: {l.stock}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-3 text-center tabular-nums text-white/90">
                                        {money.format(l.unit_price)}
                                    </td>

                                    <td className="p-3 text-center tabular-nums">
                                        {money.format(l.subtotal)}
                                    </td>

                                    <td className="p-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeLine(l.product_id)}
                                            className="h-9 px-2 rounded-xl bg-rose-500/10 text-rose-300 text-xs
                                                       border border-rose-400/20 hover:bg-rose-500/20"
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {lines.length === 0 && (
                                <tr>
                                    <td className="p-6 text-center text-white/60 text-sm" colSpan={5}>
                                        No hay productos en la venta.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-white/[0.03] text-white/80 text-sm">
                                <td className="p-3 text-right font-semibold" colSpan={3}>
                                    Total Bs.:
                                </td>
                                <td className="p-3 text-center font-bold text-[#06B6D4] tabular-nums">
                                    {money.format(total)}
                                </td>
                                <td className="p-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <button
                    type="button"
                    disabled={saving}
                    onClick={handleAskConfirm}
                    className={`h-12 min-w-[200px] rounded-2xl text-white font-bold text-lg
                bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                border border-white/10 shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                hover:brightness-110
                disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>

            </section>
            {confirmOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-[#0b1224] text-white border border-white/10 shadow-[0_24px_60px_-12px_rgba(6,182,212,0.4)] p-5">
                        <h3 className="text-lg font-bold tracking-wide text-white/90">Confirmar venta</h3>

                        <p className="text-sm text-white/70 mt-2">
                            ¿Estás seguro de registrar esta venta como <span className="font-semibold text-emerald-300">PAGADA</span>?
                        </p>

                        <div className="mt-4 space-y-2 text-sm text-white/80 bg-white/[0.03] border border-white/10 rounded-xl p-3">
                            <div className="flex justify-between">
                                <span>Fecha</span>
                                <span className="text-white/60">{todayStr}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Cliente</span>
                                <span className="text-right text-white/60 max-w-[60%] truncate">
                                    {selectedCustomer
                                        ? selectedCustomer.name
                                        : (custName || '(sin nombre)')}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Ítems</span>
                                <span className="text-white/60">
                                    {lines.reduce((acc, l) => acc + l.quantity, 0)} unid.
                                </span>
                            </div>

                            <div className="flex justify-between font-semibold text-[#06B6D4]">
                                <span>Total a cobrar</span>
                                <span>{money.format(total)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                type="button"
                                className="flex-1 sm:flex-none h-10 rounded-xl border border-white/20 bg-white/[0.07] text-white/80 text-sm hover:bg-white/10"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setPendingPayload(null);
                                }}
                                disabled={saving}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="flex-1 sm:flex-none h-10 rounded-xl text-sm font-semibold text-white
                               bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                               border border-white/10 shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                               hover:brightness-110 disabled:opacity-50"
                                onClick={confirmSaveSale}
                                disabled={saving}
                            >
                                {saving ? 'Guardando…' : 'Confirmar venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {receiptOpen && lastSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-[#0b1224] text-white border border-white/10 shadow-[0_32px_80px_-12px_rgba(124,58,237,0.5)] p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-lg font-extrabold tracking-wider text-white/90">
                                    Pixel Retro Store — Recibo
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                    Recibo #{lastSale.id} ·{' '}
                                    {lastSale.created_at
                                        ? new Date(lastSale.created_at).toLocaleString('es-BO')
                                        : '—'}
                                </div>
                                <div className="text-xs text-white/60">
                                    Ref: {lastSale.payment_ref ?? '—'}
                                    {lastSale.user?.name && (
                                        <> · Atendido por: <span className="text-white/80">{lastSale.user.name}</span></>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setReceiptOpen(false)}
                                className="text-white/50 hover:text-white/80 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
                            <div className="font-semibold text-white/90 text-sm mb-1">
                                Cliente
                            </div>
                            <div>
                                {lastSale.customer?.name ?? 'Cliente'}
                                <br />
                                {lastSale.customer?.email ?? '—'}
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] text-xs">
                            <table className="w-full text-white text-xs">
                                <thead className="bg-white/[0.05] text-white/70">
                                    <tr>
                                        <th className="p-2 text-left font-semibold">Producto</th>
                                        <th className="p-2 text-right font-semibold">Cant.</th>
                                        <th className="p-2 text-right font-semibold">P.Unit</th>
                                        <th className="p-2 text-right font-semibold">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {lastSale.details.map((d) => (
                                        <tr key={d.id}>
                                            <td className="p-2 align-top">
                                                <div className="text-white/90 font-medium">
                                                    {d.product?.name ?? `#${d.product?.id ?? ''}`}
                                                </div>
                                                {d.product?.sku && (
                                                    <div className="text-white/40 text-[10px]">
                                                        {d.product.sku}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2 text-right tabular-nums align-top">
                                                {d.quantity}
                                            </td>
                                            <td className="p-2 text-right tabular-nums align-top">
                                                Bs. {Number(d.unit_price).toFixed(2)}
                                            </td>
                                            <td className="p-2 text-right tabular-nums align-top">
                                                Bs. {Number(d.subtotal).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-white/[0.03] text-white/80">
                                    <tr>
                                        <td className="p-2 text-right font-semibold text-sm" colSpan={3}>
                                            Total
                                        </td>
                                        <td className="p-2 text-right font-bold text-[#06B6D4] tabular-nums text-sm">
                                            Bs. {Number(lastSale.total).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    void adminDownloadReceipt(lastSale.id);
                                }}
                                className="flex-1 sm:flex-none h-10 rounded-xl text-sm font-semibold text-white
                               bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                               border border-white/10 shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                               hover:brightness-110"
                            >
                                Descargar PDF
                            </button>

                            <button
                                type="button"
                                onClick={() => setReceiptOpen(false)}
                                className="flex-1 sm:flex-none h-10 rounded-xl border border-white/20 bg-white/[0.07]
                               text-white/80 text-sm hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
