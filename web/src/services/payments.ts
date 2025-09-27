import { withCustomerAuth } from './customerApi';
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type CustomerPayload = { name: string; email: string; phone?: string; address?: string };
export type CartLine = { product_id: number; qty: number };

export async function createPaymentIntent(payload: { customer: CustomerPayload; items: CartLine[]; currency?: string; amount?: number; }) {
    const r = await fetch(`${API}/api/payments/intents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...withCustomerAuth() },
        body: JSON.stringify({ currency: 'BOB', ...payload }),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export async function confirmPaymentIntent(intentId: string, payload: { client_secret: string; card_number: string; exp_month: number; exp_year: number; cvc: string; }) {
    const r = await fetch(`${API}/api/payments/intents/${intentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...withCustomerAuth() },
        body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

type Verify3DSPayload = { client_secret: string; otp: string };

export type Verify3DSResponse = {
    status: 'succeeded' | 'failed' | 'requires_action' | 'processing';
    payment_ref?: string;
    sale_id?: number;
    total?: number;
    message?: string;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object';

export async function verify3ds(
    intentId: string,
    payload: Verify3DSPayload
): Promise<Verify3DSResponse> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(withCustomerAuth() as HeadersInit),
    };

    const r = await fetch(`${API}/api/payments/intents/${intentId}/3ds/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    let data: unknown;
    try {
        data = await r.json();
    } catch {
        data = undefined;
    }

    if (!r.ok) {
        const msg =
            isObject(data) && typeof data.message === 'string'
                ? data.message
                : `Error ${r.status}`;
        throw new Error(msg);
    }

    if (!isObject(data) || typeof data.status !== 'string') {
        throw new Error('Respuesta inválida del servidor');
    }

    return data as Verify3DSResponse;
}

