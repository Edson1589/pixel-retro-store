const RAW = import.meta.env.VITE_API_URL ?? '';
const API_BASE = (RAW.endsWith('/api') ? RAW : `${RAW.replace(/\/$/, '')}/api`) || '/api';

import { withCustomerAuth } from './customerApi';

export async function signalInteract(productId: number, kind: 'view' | 'add' | 'purchase', qty = 1) {
    try {
        const headers = withCustomerAuth({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        });
        const res = await fetch(`${API_BASE}/me/products/interact`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ product_id: productId, kind, qty }),
            credentials: 'omit',
        });
        return res.ok;
    } catch {
        return false;
    }
}

export function prefer(id: number) {
    const url = `${API_BASE}/products/${id}/prefer`;
    const body = new Blob([JSON.stringify({})], { type: 'application/json' });
    if ('sendBeacon' in navigator) navigator.sendBeacon(url, body);
    else fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => { });
}

export function trackProductClick(productId: number, q: string, source = 'products_page') {
    if (!q || q.trim() === '') return;

    const url = `${API_BASE}/products/search/click`;
    const payload = JSON.stringify({ product_id: productId, q, source });

    if ('sendBeacon' in navigator) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
    } else {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
        }).catch(() => { });
    }
}

export function trackEventClick(eventId: number, q: string, source = 'events_page') {
    if (!q || q.trim() === '') return;

    const url = `${API_BASE}/events/search/click`;
    const payload = JSON.stringify({ event_id: eventId, q, source });

    if ('sendBeacon' in navigator) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return;
    } else {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
        }).catch(() => { });
    }
}
