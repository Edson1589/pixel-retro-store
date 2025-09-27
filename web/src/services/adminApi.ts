const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const KEY = 'pixelretro_admin_token';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

type HeaderMap = Record<string, string>;

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

export async function listCategories() {
    const res = await fetch(`${API_URL}/api/admin/categories`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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

export async function listProducts() {
    const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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

export async function adminListEvents() {
    const r = await fetch(`${API_URL}/api/admin/events`, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text()); return r.json();
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
export async function adminListEventRegs(eventId: number, status?: 'pending' | 'confirmed' | 'cancelled') {
    const qs = new URLSearchParams(); if (status) qs.set('status', status);
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations?${qs}`, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}
export async function adminUpdateRegStatus(eventId: number, regId: number, status: 'pending' | 'confirmed' | 'cancelled') {
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations/${regId}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ status })
    });
    if (!r.ok) throw new Error(await r.text()); return r.json();
}