const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const KEY = 'pixelretro_admin_token';

/** Storage helpers */
export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

/** Header helpers (siempre tipos consistentes) */
type HeaderMap = Record<string, string>;

const authHeaders = (): HeaderMap => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const jsonHeaders = (): HeaderMap => ({
    'Content-Type': 'application/json',
    ...authHeaders(),
});

/** Auth */
export async function adminLogin(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { token, user }
}

export async function adminLogout() {
    const res = await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    clearToken();
}

/** Categories */
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

/** Products */
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
    // OJO: no establecer Content-Type manual con FormData
    const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateProduct(id: number, fd: FormData) {
    // Si tu backend espera PUT con FormData y usas Laravel, podrías necesitar:
    // fd.append('_method', 'PUT');
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'POST', // Cambia a PUT si tu backend lo soporta directamente
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
