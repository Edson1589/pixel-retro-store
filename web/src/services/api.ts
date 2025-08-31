import type { Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type ProductsResponse = { data: Product[] };
export type ProductResponse = Product; // ajusta a { data: Product } si tu API lo devuelve así

type CheckoutItem = { product_id: number; quantity: number };
type CheckoutCustomer = {
    name: string;
    email: string;
    phone?: string;
    address?: string;
};
export type CheckoutPayload = { customer: CheckoutCustomer; items: CheckoutItem[] };
export type CheckoutResponse = { payment_ref: string; total: number };

export async function fetchProducts(
    params?: { search?: string; category?: string; page?: number }
): Promise<ProductsResponse> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.page != null) qs.set('page', String(params.page));

    const res = await fetch(`${API_URL}/api/products?${qs.toString()}`);
    if (!res.ok) throw new Error('Error cargando productos');
    const data: ProductsResponse = await res.json();
    return data;
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
