import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { checkout } from '../services/api';

type CheckoutItem = { product_id: number; quantity: number };
type CheckoutCustomer = { name: string; email: string; phone?: string; address?: string };
type CheckoutPayload = { customer: CheckoutCustomer; items: CheckoutItem[] };
type CheckoutResponse = { payment_ref: string; total: number };

const getErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try { return JSON.stringify(e); } catch { return 'Error en checkout'; }
};

export default function CartPage() {
    const { items, remove, clear, total } = useCart();
    const [form, setForm] = useState<CheckoutCustomer>({ name: '', email: '', phone: '', address: '' });
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (): Promise<void> => {
        try {
            setBusy(true); setMsg(null);
            const payload: CheckoutPayload = {
                customer: form,
                items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
            };
            const res: CheckoutResponse = await checkout(payload);
            setMsg(`Compra exitosa. Ref: ${res.payment_ref} · Total Bs. ${res.total}`);
            clear();
        } catch (e: unknown) {
            setMsg(getErrorMessage(e));
        } finally { setBusy(false); }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Carrito</h2>
            {items.length === 0 ? <p>Tu carrito está vacío.</p> : (
                <>
                    <ul className="divide-y border rounded-2xl mb-4">
                        {items.map(i => (
                            <li key={i.product.id} className="p-3 flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="font-semibold">{i.product.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {i.quantity} × Bs. {Number(i.product.price).toFixed(2)}
                                    </div>
                                </div>
                                <button onClick={() => remove(i.product.id)} className="text-sm underline">Quitar</button>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-between items-center mb-6">
                        <div className="text-lg font-bold">Total: Bs. {total.toFixed(2)}</div>
                        <button onClick={clear} className="text-sm underline">Vaciar</button>
                    </div>

                    <h3 className="font-semibold mb-2">Datos del comprador</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <input className="border rounded-xl px-3 py-2" placeholder="Nombre"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <input className="border rounded-xl px-3 py-2" placeholder="Email"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        <input className="border rounded-xl px-3 py-2" placeholder="Teléfono"
                            value={form.phone ?? ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <input className="border rounded-xl px-3 py-2" placeholder="Dirección"
                            value={form.address ?? ''} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>

                    <button
                        disabled={busy || items.length === 0 || !form.name || !form.email}
                        onClick={submit}
                        className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                    >
                        {busy ? 'Procesando...' : 'Finalizar compra'}
                    </button>

                    {msg && <p className="mt-4">{msg}</p>}
                </>
            )}
        </div>
    );
}
