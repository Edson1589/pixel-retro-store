import type {
    SalesSummary, Sale,
    EventItem,
    EventRegistration,
    EventLookupItem,
    AdminEvent,
    AdminRegistration,
    WalkInCreatePayload,
    ConflictDuplicatePayload,
    AdminUser,
    AdminLoginResponse,
    AdminUserCreatePayload,
    AdminUserUpdatePayload,
    PasswordChangePayload
} from '../types';
import type { Appointment, Page as Paginator } from '../types';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const KEY = 'pixelretro_admin_token';
const USER_KEY = 'pixelretro_admin_user';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);
export type ApiMsg = { message: string };
type ListParams = { status?: string; from?: string; to?: string; page?: number; per_page?: number; };

export const getAdminUser = (): AdminUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AdminUser; } catch { return null; }
};

export const setAdminUser = (u: AdminUser): void => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const clearAdminUser = (): void => localStorage.removeItem(USER_KEY);

type HeaderMap = Record<string, string>;

import type { Product } from '../types';

export type PosProduct = {
    id: number;
    name: string;
    sku?: string | null;
    price: number;
    stock: number;
    is_unique: boolean;
    image_url?: string | null;
};

export type PosCustomer = {
    id: number;
    name: string;
    ci?: string | null;
    email: string;
    phone?: string | null;
    address?: string | null;
};

export type PosLineInput = {
    product_id: number;
    quantity: number;
    unit_price?: number;
};

export type PosSalePayload = {
    customer_id?: number | null;
    customer?: {
        name: string;
        ci?: string | null;
        email: string;
        phone?: string | null;
        address?: string | null;
    };
    items: PosLineInput[];
};

export type PosCreatedSale = {
    data: {
        id: number;
        status: 'paid' | 'pending' | 'failed';
        payment_ref: string | null;
        total: number;
        items_qty: number;
        created_at: string | null;
        customer?: {
            id: number;
            name: string;
            email: string;
        };
        user?: { id: number; name: string };
        details: Array<{
            id: number;
            product?: {
                id: number;
                name?: string;
                sku?: string | null;
                image_url?: string | null;
            };
            quantity: number;
            unit_price: number;
            subtotal: number;
        }>;
    };
};

export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const authHeaders = (): HeaderMap => {
    const t = getToken();
    return {
        Accept: 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
};

const jsonHeaders = (): HeaderMap => ({
    'Content-Type': 'application/json',
    ...authHeaders(),
});

class PreconditionRequiredError extends Error {
    code: number;
    constructor(message: string) { super(message); this.code = 428; }
}

async function handleJson<T>(res: Response): Promise<T> {
    if (res.status === 428) {
        const msg = await res.text();
        throw new PreconditionRequiredError(msg || 'Debes cambiar tu contraseña.');
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
}


export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
    const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
    });
    const data = await handleJson<AdminLoginResponse>(res);
    return data;
}

export async function adminLogout(): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/admin/logout`, { method: 'POST', headers: authHeaders() });
    const out = await handleJson<{ message: string }>(res);
    clearToken();
    clearAdminUser();
    return out;
}

export async function adminListUsers<T = AdminUser>(params?: {
    page?: number; perPage?: number; search?: string;
}): Promise<Page<T>> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.perPage != null) qs.set('per_page', String(params.perPage));
    if (params?.search) qs.set('search', params.search);

    const url = `${API_URL}/api/admin/users${qs.toString() ? `?${qs.toString()}` : ''}`;
    const res = await fetch(url, { headers: authHeaders() });
    return handleJson<Page<T>>(res);
}

export async function adminGetUser(id: number): Promise<AdminUser> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, { headers: authHeaders() });
    return handleJson<AdminUser>(res);
}

export async function adminCreateUser(payload: AdminUserCreatePayload): Promise<AdminUser> {
    const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleJson<AdminUser>(res);
}

export async function adminUpdateUser(id: number, payload: AdminUserUpdatePayload): Promise<AdminUser> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleJson<AdminUser>(res);
}

export async function adminDeleteUser(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() });
    return handleJson<{ message: string }>(res);
}

export async function adminChangePassword(payload: PasswordChangePayload): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/admin/password/change`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleJson<{ message: string }>(res);
}

export async function adminForgotPassword(email: string): Promise<ApiMsg> {
    const res = await fetch(`${API_URL}/api/admin/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
    });
    const txt = await res.text();
    try { return JSON.parse(txt) as ApiMsg; } catch { return { message: txt || 'OK' }; }
}

export { PreconditionRequiredError };

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

export async function adminListEvents<T = EventItem>(params?: {
    page?: number; perPage?: number; search?: string; type?: 'event' | 'tournament' | 'all';
}): Promise<Page<T>> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.perPage != null) qs.set('per_page', String(params.perPage));
    if (params?.search) qs.set('search', params.search);
    if (params?.type && params.type !== 'all') qs.set('type', params.type);

    const base = `${API_URL}/api/admin/events`;
    const url = qs.toString() ? `${base}?${qs.toString()}` : base;

    const r = await fetch(url, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<Page<T>>;
}

export async function adminGetEvent(id: number): Promise<AdminEvent> {
    const r = await fetch(`${API_URL}/api/admin/events/${id}`, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<AdminEvent>;
}

export async function adminLookupEvents(params?: {
    search?: string;
    type?: 'event' | 'tournament';
}): Promise<EventLookupItem[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.type) qs.set('type', params.type);

    const base = `${API_URL}/api/admin/events/lookup`;
    const url = qs.toString() ? `${base}?${qs.toString()}` : base;

    const r = await fetch(url, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<EventLookupItem[]>;
}

export async function adminListEventRegs<T = EventRegistration>(
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
    if (params?.search) qs.set('q', params.search);

    const base = `${API_URL}/api/admin/events/${eventId}/registrations`;
    const url = qs.toString() ? `${base}?${qs.toString()}` : base;

    const r = await fetch(url, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<Page<T>>;
}

export async function adminUpdateRegStatus(
    eventId: number,
    regId: number,
    status: 'pending' | 'confirmed' | 'cancelled'
): Promise<AdminRegistration> {
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations/${regId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status })
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<AdminRegistration>;
}

export class ConflictDuplicateError extends Error {
    public readonly payload: ConflictDuplicatePayload;
    public readonly status: number;
    constructor(payload: ConflictDuplicatePayload, status: number) {
        super(payload.message);
        this.payload = payload;
        this.status = status;
    }
}

export async function adminCreateEventRegistration(
    eventId: number,
    payload: WalkInCreatePayload
): Promise<AdminRegistration> {
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
    });

    if (r.status === 409) {
        const data = (await r.json()) as ConflictDuplicatePayload;
        throw new ConflictDuplicateError(data, 409);
    }

    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<AdminRegistration>;
}

export async function adminUpdateEventRegistration(
    eventId: number,
    regId: number,
    patch: Partial<Pick<WalkInCreatePayload, 'name' | 'email' | 'gamer_tag' | 'team' | 'notes' | 'status'>>
): Promise<AdminRegistration> {
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(patch)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<AdminRegistration>;
}

export async function adminCheckinRegistration(
    eventId: number,
    regId: number
): Promise<AdminRegistration> {
    const r = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations/${regId}/checkin`, {
        method: 'POST',
        headers: { ...authHeaders() }
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<AdminRegistration>;
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

export async function adminPosSearchProducts(q: string): Promise<PosProduct[]> {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    const res = await fetch(`${API_URL}/api/admin/pos/products?${qs.toString()}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<PosProduct[]>;
}

export async function adminPosSearchCustomers(q: string): Promise<PosCustomer[]> {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    const res = await fetch(`${API_URL}/api/admin/pos/customers?${qs.toString()}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<PosCustomer[]>;
}

export async function adminPosCreateSale(payload: PosSalePayload): Promise<PosCreatedSale> {
    const res = await fetch(`${API_URL}/api/admin/pos/sales`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<PosCreatedSale>;
}

export async function adminDeliverSale(
    id: number,
    payload: { ci: string; notes?: string }): Promise<Sale> {
    const res = await fetch(`${API_URL}/api/admin/sales/${id}/deliver`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    return j.data ?? j;
}

export async function adminDownloadDeliveryNote(
    id: number,
    filename = `nota-entrega-${id}.pdf`
): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/sales/${id}/delivery-note`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export async function adminVoidSale(
    id: number,
    reason?: string
): Promise<Sale> {
    const res = await fetch(`${API_URL}/api/admin/sales/${id}/void`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ reason: reason ?? null }),
    });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    return j.data ?? j;
}

export async function adminListAppointments(params?: ListParams) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));

    const res = await fetch(`${API_URL}/api/admin/appointments${qs.size ? `?${qs}` : ''}`, { headers: authHeaders() });
    return handleJson<Paginator<Appointment>>(res);
}

export async function adminAcceptAppointment(id: number, payload: { scheduled_at: string; duration_minutes?: number }) {
    const res = await fetch(`${API_URL}/api/admin/appointments/${id}/accept`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleJson<{ message: string; data: Appointment }>(res);
}

export async function adminRejectAppointment(id: number, reason: string) {
    const res = await fetch(`${API_URL}/api/admin/appointments/${id}/reject`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify({ reason }),
    });
    return handleJson<{ message: string; data: Appointment }>(res);
}

export async function adminRescheduleAppointment(id: number, payload: { proposed_at: string; note?: string; duration_minutes?: number }) {
    const res = await fetch(`${API_URL}/api/admin/appointments/${id}/reschedule`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleJson<{ message: string; data: Appointment }>(res);
}

export async function adminCompleteAppointment(
    id: number,
    payload: {
        service_amount: number;
        parts?: Array<{ product_id: number; quantity: number; unit_price?: number }>;
        discount?: number;
        payment_status?: 'paid' | 'pending';
        payment_ref?: string | null;
    }
) {
    const res = await fetch(`${API_URL}/api/admin/appointments/${id}/complete`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return handleJson<{ message: string; data: Appointment }>(res);
}
