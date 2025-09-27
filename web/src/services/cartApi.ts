import { withCustomerAuth } from './customerApi';
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type CartPutItem = { product_id: number; quantity: number };

export type CartProductLite = {
    id: number;
    name: string;
    price: number | string;
    image_url?: string | null;
};

export type CartGetItem = CartPutItem & {
    unit_price: number;
    product?: CartProductLite;
};

export type CartResponse = { items: CartGetItem[] };

const isObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object';

export async function cartGet(): Promise<CartResponse> {
    const headers: HeadersInit = { ...(withCustomerAuth() as HeadersInit) };
    const r = await fetch(`${API}/api/cart`, { headers });

    let data: unknown;
    try {
        data = await r.json();
    } catch {
        data = undefined;
    }

    if (!r.ok) {
        const msg = isObject(data) && typeof data.message === 'string'
            ? data.message
            : `Error ${r.status}`;
        throw new Error(msg);
    }

    return (data ?? { items: [] }) as CartResponse;
}

export async function cartPut(items: CartPutItem[]): Promise<CartResponse> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(withCustomerAuth() as HeadersInit),
    };

    const r = await fetch(`${API}/api/cart`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ items }),
    });

    let data: unknown;
    try {
        data = await r.json();
    } catch {
        data = undefined;
    }

    if (!r.ok) {
        const msg = isObject(data) && typeof data.message === 'string'
            ? data.message
            : `Error ${r.status}`;
        throw new Error(msg);
    }

    return (data ?? { items: [] }) as CartResponse;
}
