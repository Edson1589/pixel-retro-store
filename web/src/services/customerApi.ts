const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const KEY = 'pixelretro_customer_token';

export type CustomerUser = { id: number; name: string; email: string; role: 'customer' };
export type AuthPayload = {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
    phone?: string;
    address?: string;
};
export type AuthResponse = { token: string; user: CustomerUser };

export const getCustomerToken = () => localStorage.getItem(KEY);
export const setCustomerToken = (t: string) => localStorage.setItem(KEY, t);
export const clearCustomerToken = () => localStorage.removeItem(KEY);

export const withCustomerAuth = (extra: HeadersInit = {}) => {
    const t = getCustomerToken();
    return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
};

// -------- AUTH --------
export async function customerRegister(payload: AuthPayload): Promise<AuthResponse> {
    const r = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export async function customerLogin(email: string, password: string): Promise<AuthResponse> {
    const r = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export async function customerMe(): Promise<CustomerUser> {
    const r = await fetch(`${API}/api/auth/me`, { headers: withCustomerAuth() });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export async function customerLogout() {
    const r = await fetch(`${API}/api/auth/logout`, { method: 'POST', headers: withCustomerAuth() });
    if (!r.ok) throw new Error(await r.text());
    clearCustomerToken();
}
