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
    id: number; title: string; slug: string; type: 'event' | 'tournament';
    description?: string | null; location?: string | null;
    start_at: string; end_at?: string | null;
    capacity?: number | null; status: 'draft' | 'published' | 'archived';
    banner_url?: string | null;
    registration_open_at?: string | null;
    registration_close_at?: string | null;
};

export type EventRegistration = {
    id: number; event_id: number; name: string; email: string;
    gamer_tag?: string | null; team?: string | null; notes?: string | null;
    status: 'pending' | 'confirmed' | 'cancelled';
};

export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
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
