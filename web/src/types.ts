export type Category = { id: number; name: string; slug: string; products_count: number; };
export type Product = {
    id: number; category_id: number | null; name: string; slug: string; sku: string | null;
    description: string | null; price: number | string; stock: number;
    condition: 'new' | 'used' | 'refurbished'; is_unique: boolean; image_url: string | null;
    status: 'active' | 'draft'; category?: Category;
};
export type CartItem = { product: Product; quantity: number };
export type CheckoutPayload = {
    customer: { name: string; email: string; phone?: string; address?: string };
    items: { product_id: number; quantity: number }[];
};

export type EventItem = {
    id: number;
    title: string;
    slug: string;
    type: 'event' | 'tournament';
    description?: string | null;
    location?: string | null;
    start_at: string;
    end_at?: string | null;
    capacity?: number | null;
    status: 'draft' | 'published' | 'archived';
    banner_url?: string | null;
    registration_open_at?: string | null;
    registration_close_at?: string | null;

    registration_open?: boolean;
    remaining_capacity?: number | null;
};

export type EventRegistration = {
    id: number;
    event_id: number;
    name: string;
    email: string;
    gamer_tag?: string | null;
    team?: string | null;
    notes?: string | null;
    status: 'pending' | 'confirmed' | 'cancelled';
};

export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type EventLookupItem = {
    id: number;
    title: string;
    type: 'event' | 'tournament';
    start_at: string;
    end_at?: string | null;
    location?: string | null;
    capacity?: number | null;
    status: 'draft' | 'published' | 'archived';
};

export type AdminEvent = {
    id: number;
    title: string;
    type: 'event' | 'tournament';
    start_at: string;
    end_at?: string | null;
    location?: string | null;
    status: 'draft' | 'published' | 'archived';
    capacity?: number | null;
    registrations_count?: number;
    description?: string | null;
    banner_url?: string | null;
    registration_open?: boolean;
    remaining_capacity?: number | null;
};

export type AdminRegistration = EventRegistration & {
    ticket_code?: string | null;
    ticket_issued_at?: string | null;
    source?: 'web' | 'admin' | 'import' | 'onsite' | null;
    created_by_admin_id?: number | null;
    checked_in_at?: string | null;
    checked_in_by?: number | null;
};

export type WalkInCreatePayload = {
    name: string;
    email: string;
    gamer_tag?: string | null;
    team?: string | null;
    notes?: string | null;
    status?: 'pending' | 'confirmed' | 'cancelled';
    force?: boolean;
    send_email?: boolean;
    check_in?: boolean;
};

export type ConflictDuplicatePayload = {
    message: string;
    existing: Pick<AdminRegistration, 'id' | 'status' | 'ticket_code'>;
};

export type SlimUser = { id: number; name: string };
export type SlimCustomer = {
    id: number;
    name: string;
    ci?: string | null;
    email: string | null;
    phone?: string | null;
    address?: string | null;
};

export type SaleDetail = {
    id: number;
    product?: { id: number; name: string; sku?: string | null; image_url?: string | null };
    quantity: number;
    unit_price: number;
    subtotal: number;
};

export type Sale = {
    id: number;
    status: 'pending' | 'paid' | 'failed';
    payment_ref?: string | null;
    total: number;
    items_qty?: number | null;
    created_at?: string | null;
    customer?: SlimCustomer | null;
    user?: SlimUser | null;
    details?: SaleDetail[];
    delivery_status: 'to_deliver' | 'delivered';
    delivered_at: string | null;
    delivered_by?: { id: number; name: string } | null;
    is_canceled: boolean;
    canceled_at: string | null;
    cancel_reason?: string | null;
    canceled_by?: { id: number; name: string } | null;
    pickup_doc_url?: string | null;
};

export type SalesSummary = {
    range: { from: string; to: string };
    totals: {
        recaudado: number;
        ventas_total: number;
        ticket_prom: number;
        gross_total: number;
        vendidas: number;
        por_entregar: number;
        entregado: number;
        anuladas: number;
        items_sold: number;
    };
    products: {
        distinct: number;
        total_qty: number;
        top: { product: { id: number; name: string; sku?: string | null; image_url?: string | null }, qty: number, revenue: number }[];
    };
};

export type Role = 'admin' | 'seller' | 'technician' | 'customer';

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: Role;
    must_change_password?: boolean;
    temp_password_expires_at?: string | null;
    created_by_admin_id?: number | null;
    last_login_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
};

export type AdminLoginResponse = {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: Role;
        must_change_password?: boolean;
    };
};

export type AdminUserCreatePayload = {
    name: string;
    email: string;
    role: Exclude<Role, 'customer'>;
    temp_expires_in_hours?: number;
};

export type AdminUserUpdatePayload = {
    name?: string;
    email?: string;
    role?: Exclude<Role, 'customer'>;
    must_change_password?: boolean;
};

export type PasswordChangePayload = {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
};

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

export type AppointmentStatus =
    | 'pending'
    | 'confirmed'
    | 'rejected'
    | 'rescheduled'
    | 'completed'
    | 'cancelled';

export type ServiceType = 'repair' | 'maintenance' | 'diagnostic';
export type AppointmentLocation = 'shop' | 'home';

export type Appointment = {
    id: number;
    customer_id: number;
    technician_id?: number | null;
    service_type: ServiceType;
    console: string;
    problem_description: string;
    location: AppointmentLocation;
    address?: string | null;
    contact_phone: string;
    preferred_at: string;
    scheduled_at?: string | null;
    duration_minutes: number;
    status: AppointmentStatus;
    reschedule_proposed_at?: string | null;
    reschedule_note?: string | null;
    reject_reason?: string | null;
    customer_notes?: string | null;
    created_at: string;
    updated_at: string;
    customer?: { id: number; name: string; email: string };
    technician?: { id: number; name: string; email: string } | null;
};
