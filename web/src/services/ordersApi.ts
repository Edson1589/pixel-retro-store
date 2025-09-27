import { withCustomerAuth } from './customerApi';
const API = import.meta.env.VITE_API_URL ?? 'https://pixelbackend.infinityfreeapp.com';

export type OrderItem = {
    id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    unit_price: number | string;
    subtotal: number | string;
    product?: { id: number; name: string; image_url?: string | null };
};

export type Order = {
    id: number;
    total: number | string;
    status: 'pending' | 'paid' | 'failed';
    payment_ref?: string | null;
    created_at: string;
    details: OrderItem[];
};

export type OrdersPage = {
    data: Order[];
    current_page?: number;
    last_page?: number;
    total?: number;
};

const headers = (): HeadersInit => ({ ...(withCustomerAuth() as HeadersInit) });

export async function listMyOrders(page = 1): Promise<OrdersPage> {
    const r = await fetch(`${API}/api/me/orders?page=${page}`, { headers: headers() });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<OrdersPage>;
}

export async function getMyOrder(id: number): Promise<Order> {
    const r = await fetch(`${API}/api/me/orders/${id}`, { headers: headers() });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<Order>;
}

export async function downloadReceipt(id: number, filename = `recibo-${id}.pdf`): Promise<void> {
    const r = await fetch(`${API}/api/account/orders/${id}/receipt`, {
        headers: { ...(withCustomerAuth() as HeadersInit) },
    });
    if (!r.ok) throw new Error(await r.text());
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
