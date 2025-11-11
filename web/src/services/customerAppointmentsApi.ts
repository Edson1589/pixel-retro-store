import { withCustomerAuth } from './customerApi';
import type { Appointment, AppointmentStatus } from '../types';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export const SERVICE_TYPES = ['repair', 'maintenance', 'diagnostic'] as const;
export type ServiceType = typeof SERVICE_TYPES[number];

export const APPT_LOCATIONS = ['shop', 'home'] as const;
export type AppointmentLocation = typeof APPT_LOCATIONS[number];

export type CreateAppointmentPayload = {
    service_type: ServiceType;
    console: string;
    problem_description: string;
    location: AppointmentLocation;
    address?: string | null;
    contact_phone: string;
    preferred_at: string;
    duration_minutes?: number | null;
    customer_notes?: string;
};

export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const json = (init: RequestInit = {}) => ({
    ...init,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...withCustomerAuth(init.headers ?? {}) },
});

async function req<T>(path: string, init: RequestInit) {
    const res = await fetch(`${API}/api${path}`, init);
    const body = await (async () => {
        const ct = res.headers.get('Content-Type') || '';
        if (ct.includes('application/json')) try { return await res.json(); } catch { return null; }
        const txt = await res.text().catch(() => '');
        try { return JSON.parse(txt); } catch { return txt; }
    })();
    if (!res.ok) throw new Error((body && (body.message ?? body)) || 'Error en la solicitud');
    return body as T;
}

export async function customerListAppointments(params?: { status?: AppointmentStatus; page?: number; per_page?: number; }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    return req<Page<Appointment>>(`/appointments${qs.size ? `?${qs}` : ''}`, { method: 'GET', headers: withCustomerAuth() });
}

export async function customerCreateAppointment(payload: CreateAppointmentPayload) {
    return req<{ message: string; available: boolean; data: Appointment }>(
        `/appointments`,
        json({ method: 'POST', body: JSON.stringify(payload) }),
    );
}

export async function customerShowAppointment(id: number) {
    return req<Appointment>(`/appointments/${id}`, { method: 'GET', headers: withCustomerAuth() });
}

export async function customerConfirmReschedule(id: number, accept: boolean) {
    return req<{ message: string; data: Appointment }>(
        `/appointments/${id}/confirm-reschedule`,
        json({ method: 'POST', body: JSON.stringify({ accept }) }),
    );
}

export async function customerCancelAppointment(id: number) {
    return req<{ message: string; data: Appointment }>(
        `/appointments/${id}/cancel`,
        json({ method: 'POST' }),
    );
}
