import type { Product } from '../types';
import { withCustomerAuth } from './customerApi';
import type { Category } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type ProductsResponse = { data: Product[] };
export type ProductResponse = Product;

type CheckoutItem = { product_id: number; quantity: number };
type CheckoutCustomer = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};
export type CheckoutPayload = { customer: CheckoutCustomer; items: CheckoutItem[] };
export type CheckoutResponse = { payment_ref: string; total: number };

/**
 * Manejo uniforme de errores de la API
 */
async function handleError(res: Response): Promise<never> {
  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const code =
    data?.code ||
    (res.status === 0 ? 'network_error' : `http_${res.status}`);
  const message =
    data?.message || (await res.text().catch(() => `Error ${res.status}`));

  throw { code, message };
}

export async function fetchProducts(
  params?: { search?: string; category?: string; page?: number }
): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.category) qs.set('category', params.category);
  if (params?.page != null) qs.set('page', String(params.page));

  const res = await fetch(`${API_URL}/api/products?${qs.toString()}`);
  if (!res.ok) return handleError(res);
  return res.json();
}

export async function fetchProduct(slug: string) {
  const url = `${API_URL}/api/products/${slug}`;
  console.log('🚀 Llamando API:', url);
  const res = await fetch(url);
  if (!res.ok) return handleError(res);
  return res.json();
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const res = await fetch(`${API_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleError(res);
  return res.json();
}

export async function fetchEvents(params?: {
  type?: 'event' | 'tournament';
  search?: string;
  upcoming?: boolean;
  page?: number;
  per_page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.search) qs.set('search', params.search);
  if (params?.upcoming !== undefined) qs.set('upcoming', params.upcoming ? '1' : '0');
  if (params?.page) qs.set('page', String(params.page));
  qs.set('per_page', String(params?.per_page ?? 12));

  const res = await fetch(`${API_URL}/api/events?${qs.toString()}`);
  if (!res.ok) return handleError(res);
  return res.json();
}

export async function fetchEventBySlug(slug: string) {
  const res = await fetch(`${API_URL}/api/events/${slug}`);
  if (!res.ok) return handleError(res);
  return res.json();
}

export async function registerToEvent(
  slug: string,
  payload: { name: string; email: string; gamer_tag?: string; team?: string; notes?: string }
) {
  const res = await fetch(`${API_URL}/api/events/${slug}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...withCustomerAuth() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleError(res);
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) return handleError(res);
  return res.json();
}
