import type { Product } from '../types';
import { withCustomerAuth } from './customerApi';
import type { Category } from '../types';
import type { EventItem } from '../types';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_BASE = (API_URL.endsWith('/api') ? API_URL : `${API_URL.replace(/\/$/, '')}/api`);

export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type ProductsResponse = Page<Product>;
export type ProductResponse = Product;
export type EventsResponse = Page<EventItem>;

type CheckoutItem = { product_id: number; quantity: number };
type CheckoutCustomer = {
    name: string;
    email: string;
    phone?: string;
    address?: string;
};
export type CheckoutPayload = { customer: CheckoutCustomer; items: CheckoutItem[] };
export type CheckoutResponse = { payment_ref: string; total: number };

export async function fetchProducts(params?: {
    search?: string;
    category?: string;
    condition?: string;
    page?: number;
    per_page?: number;
    sort?: string;
}): Promise<Page<Product>> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.condition) qs.set('condition', params.condition);
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.per_page != null) qs.set('per_page', String(params.per_page));
    if (!params?.search) qs.set('sort', params?.sort ?? 'trending');

    const url = `${API_BASE}/products${qs.toString() ? `?${qs.toString()}` : ''}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: withCustomerAuth({
            'Accept': 'application/json',
        }),
        credentials: 'omit',
        cache: 'no-store',
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || 'Error cargando productos');
    }
    return res.json();
}

export async function fetchProduct(slug: string): Promise<ProductResponse> {
    const res = await fetch(`${API_URL}/api/products/${slug}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    const data: ProductResponse = await res.json();
    return data;
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const data: CheckoutResponse = await res.json();
    return data;
}

export async function fetchEvents<T = EventItem>(params?: {
    type?: 'event' | 'tournament' | 'all';
    search?: string;
    upcoming?: boolean;
    page?: number;
    per_page?: number;
}): Promise<Page<T>> {
    const qs = new URLSearchParams();
    if (params?.type && params.type !== 'all') qs.set('type', params.type);
    if (params?.search) qs.set('search', params.search);
    if (params?.upcoming != null) qs.set('upcoming', params.upcoming ? '1' : '0');
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.per_page != null) qs.set('per_page', String(params.per_page));

    const base = `${API_URL}/api/events`;
    const url = qs.toString() ? `${base}?${qs}` : base;

    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Page<T>>;
}

export async function fetchEventBySlug(slug: string) {
    const res = await fetch(`${API_URL}/api/events/${slug}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function registerToEvent(slug: string, payload: { name: string; email: string; gamer_tag?: string; team?: string; notes?: string }) {
    const res = await fetch(`${API_URL}/api/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...withCustomerAuth() },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function fetchMyRegistration(
    slug: string,
    email?: string
): Promise<{ registered: boolean; status?: 'pending' | 'confirmed' | 'cancelled'; registration?: unknown }> {
    const qs = new URLSearchParams();
    if (email) qs.set('email', email);

    const url = `${API_URL}/api/events/${slug}/my-registration${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: { ...withCustomerAuth() } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/api/categories?onlyNonEmpty=1`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}