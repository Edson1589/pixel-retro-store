const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const KEY = 'pixelretro_customer_token';

export type CustomerUser = {
    id: number;
    name: string;
    email: string;
    role: 'customer';
    must_change_password?: boolean;
};

export type AuthPayload = {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
    phone?: string;
    address?: string;
};
export type AuthResponse = { token: string; user: CustomerUser };

export type PasswordChangePayload = {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
};

export const getCustomerToken = () => localStorage.getItem(KEY);
export const setCustomerToken = (t: string) => localStorage.setItem(KEY, t);
export const clearCustomerToken = () => localStorage.removeItem(KEY);

export const withCustomerAuth = (extra: HeadersInit = {}) => {
    const t = getCustomerToken();
    return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
};

export class ApiError extends Error {
    status: number;
    data?: unknown;
    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

type ErrorMap = Record<string, string[]>;
type LaravelError = { message?: string; errors?: ErrorMap };

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === 'string');

const isErrorMap = (v: unknown): v is ErrorMap =>
    isRecord(v) && Object.values(v).every(isStringArray);

const hasOwn = (obj: object, key: PropertyKey): boolean =>
    Object.prototype.hasOwnProperty.call(obj, key);

const isLaravelError = (d: unknown): d is LaravelError => {
    if (!isRecord(d)) return false;

    const hasMessage =
        hasOwn(d, 'message') &&
        typeof (d as Record<string, unknown>)['message'] === 'string';

    const hasErrors =
        hasOwn(d, 'errors') &&
        isErrorMap((d as Record<string, unknown>)['errors']);

    return hasMessage || hasErrors;
};

const firstFieldError = (d: unknown, prefer: string[] = []): string | null => {
    if (!isLaravelError(d)) return null;

    const errors = d.errors;
    if (errors && isErrorMap(errors)) {
        for (const key of prefer) {
            const arr = errors[key];
            if (arr?.[0]) return arr[0];
        }

        const [firstKey] = Object.keys(errors);
        if (firstKey && errors[firstKey]?.[0]) return errors[firstKey][0];
    }

    return typeof d.message === 'string' ? d.message : null;
};

const defaultMessageForStatus = (status: number) => {
    if (status >= 500) return 'Error del servidor. Inténtalo más tarde.';
    if (status === 404) return 'Recurso no encontrado.';
    if (status === 403) return 'Acceso denegado.';
    if (status === 401) return 'No autorizado.';
    return 'Error al procesar la solicitud.';
};

const extractMessage = (status: number, data: unknown, prefer: string[] = []) => {
    const laravelMsg = firstFieldError(data, prefer);
    if (laravelMsg) return laravelMsg;

    if (typeof data === 'string' && data.trim()) {
        return defaultMessageForStatus(status);
    }
    return defaultMessageForStatus(status);
};


async function request<T>(
    url: string,
    init: RequestInit,
    mapError?: (status: number, data: unknown) => string | null
): Promise<T> {
    try {
        const res = await fetch(url, init);

        let data: unknown = null;
        const ct = res.headers.get('Content-Type') || '';
        if (ct.includes('application/json')) {
            try { data = await res.json(); } catch { data = null; }
        } else {
            const txt = await res.text().catch(() => '');
            try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
        }

        if (!res.ok) {
            const custom = mapError?.(res.status, data);
            const msg = custom ?? extractMessage(res.status, data, ['email', 'password', 'name']);
            throw new ApiError(msg, res.status, data);
        }

        return data as T;
    } catch (e) {
        if (e instanceof ApiError) throw e;
        if (e instanceof TypeError) {
            throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', 0);
        }
        throw new ApiError('Error inesperado.', 0);
    }
}

export async function customerRegister(payload: AuthPayload): Promise<AuthResponse> {
    return request<AuthResponse>(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
    }, (status, data) => {
        if (status === 409) return 'Este correo ya está registrado.';
        if (status === 422) return firstFieldError(data, ['email', 'password', 'name']) ?? 'Revisa los datos ingresados.';
        return null;
    });
}

export async function customerLogin(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }, (status, data) => {
        if (status === 401) return 'Credenciales inválidas.';
        if (status === 422) return firstFieldError(data, ['email', 'password']) ?? 'Revisa tu email y contraseña.';
        return null;
    });
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

export async function customerForgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API}/api/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
    });
}

export async function customerChangePassword(payload: PasswordChangePayload): Promise<{ message: string }> {
    return request<{ message: string }>(`${API}/api/auth/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...withCustomerAuth() },
        body: JSON.stringify(payload),
    }, (status) => {
        if (status === 422) return 'Verifica la contraseña actual y los requisitos.';
        return null;
    });
}
