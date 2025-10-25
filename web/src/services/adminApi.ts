import type { SalesSummary, Sale } from '../types';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const KEY = 'pixelretro_admin_token';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

type HeaderMap = Record<string, string>;

import type { Product } from '../types';

export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const authHeaders = (): HeaderMap => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const jsonHeaders = (): HeaderMap => ({
    'Content-Type': 'application/json',
    ...authHeaders(),
});

export async function adminLogin(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function adminLogout() {
    const res = await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    clearToken();
}

export async function adminListCategories<T = unknown>(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
}): Promise<Page<T>> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.perPage != null) qs.set('per_page', String(params.perPage));
    if (params?.search) qs.set('search', params.search);
    if (params?.status && params.status !== 'all') qs.set('status', params.status);

    const base = `${API_URL}/api/admin/categories`;
    const query = qs.toString();
    const url = query ? `${base}?${query}` : base;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Page<T>>;
}

export async function createCategory(payload: { name: string; slug: string }) {
    const res = await fetch(`${API_URL}/api/admin/categories`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateCategory(id: number, payload: { name: string; slug: string }) {
    const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getCategory(id: number) {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}


export async function deleteCategory(id: number) {
    const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function listProducts(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: 'active' | 'draft';
}): Promise<Page<Product>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.perPage) qs.set('per_page', String(params.perPage));
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);

    const res = await fetch(`${API_URL}/api/admin/products?${qs}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Page<Product>>;
}

export async function getProduct(id: number) {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function createProduct(fd: FormData) {
    const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateProduct(id: number, fd: FormData) {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteProduct(id: number) {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function adminListEvents<T = Event>(params?: {
    page?: number; perPage?: number; search?: string; type?: 'event' | 'tournament' | 'all';
}): Promise<Page<T>> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.perPage != null) qs.set('per_page', String(params.perPage));
    if (params?.search) qs.set('search', params.search);
    if (params?.type && params.type !== 'all') qs.set('type', params.type);

    const base = `${API_URL}/api/admin/events`;
    const query = qs.toString();
    const url = query ? `${base}?${query}` : base;

    const r = await fetch(url, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<Page<T>>;
}
export async function adminGetEvent(id: number) {
    const r = await fetch(`${API_URL}/api/admin/events/${id}`, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}
export async function adminCreateEvent(fd: FormData) {
    const r = await fetch(`${API_URL}/api/admin/events`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}
export async function adminUpdateEvent(id: number, fd: FormData) {
    const r = await fetch(`${API_URL}/api/admin/events/${id}`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}
export async function adminDeleteEvent(id: number) {
    const r = await fetch(`${API_URL}/api/admin/events/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}
export async function adminListEventRegs<T = unknown>(
    eventId: number,
    params?: {
        page?: number;
        perPage?: number;
        status?: 'pending' | 'confirmed' | 'cancelled';
        search?: string;
    }
): Promise<Page<T>> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.perPage != null) qs.set('per_page', String(params.perPage));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);

    const base = `${API_URL}/api/admin/events/${eventId}/registrations`;
    const query = qs.toString();
    const url = query ? `${base}?${query}` : base;

    const r = await fetch(url, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<Page<T>>;
}

export async function adminUpdateRegStatus(eventId: number, regId: number, status: 'pending' | 'confirmed' | 'cancelled') {
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations/${regId}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ status })
    });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function adminListSales(params?: {
    page?: number; perPage?: number; q?: string;
    status?: 'pending' | 'paid' | 'failed';
    from?: string; to?: string;
    today?: boolean;
}): Promise<Page<Sale>> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.perPage != null) qs.set('per_page', String(params.perPage));
    if (params?.q) qs.set('q', params.q);
    if (params?.status) qs.set('status', params.status);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.today) qs.set('today', '1');

    const url = `${API_URL}/api/admin/sales${qs.toString() ? `?${qs}` : ''}`;
    const r = await fetch(url, { headers: authHeaders() });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();

    if (j?.meta && Array.isArray(j.data)) {
        const m = j.meta;
        return {
            data: j.data,
            current_page: Number(m.current_page ?? 1),
            last_page: Number(m.last_page ?? 1),
            per_page: Number(m.per_page ?? j.data.length ?? 0),
            total: Number(m.total ?? j.data.length ?? 0),
        };
    }
    return j as Page<Sale>;
}

export async function adminGetSale(id: number): Promise<Sale> {
    const r = await fetch(`${API_URL}/api/admin/sales/${id}`, { headers: authHeaders() });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    return j.data ?? j;
}

export async function adminUpdateSaleStatus(
    id: number,
    status: 'pending' | 'paid' | 'failed'
): Promise<Sale> {
    const r = await fetch(`${API_URL}/api/admin/sales/${id}/status`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    return j.data ?? j;
}

export async function adminGetSalesSummary(params?: {
    from?: string; to?: string; limit?: number;
}): Promise<SalesSummary> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.limit != null) qs.set('limit', String(params.limit));
    const url = `${API_URL}/api/admin/sales/summary${qs.toString() ? `?${qs}` : ''}`;
    const r = await fetch(url, { headers: authHeaders() });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<SalesSummary>;
}

export async function adminExportSalesCsv(params?: {
    from?: string; to?: string; status?: 'pending' | 'paid' | 'failed'; q?: string;
}): Promise<void> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);

    const url = `${API_URL}/api/admin/sales/export${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const nameFrom = params?.from ?? 'all';
    const nameTo = params?.to ?? 'all';
    a.download = `sales_${nameFrom}_to_${nameTo}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

export async function adminExportSalesReport(params?: {
    from?: string; to?: string; status?: 'pending' | 'paid' | 'failed'; q?: string;
    format?: 'pdf' | 'csv' | 'xlsx';
}): Promise<void> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    qs.set('format', params?.format ?? 'pdf');

    const url = `${API_URL}/api/admin/sales/export${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const nameFrom = params?.from ?? 'all';
    const nameTo = params?.to ?? 'all';
    a.download = `sales_${nameFrom}_to_${nameTo}.${params?.format ?? 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

export async function adminDownloadReceipt(id: number, filename = `recibo-${id}.pdf`): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/sales/${id}/receipt`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}
