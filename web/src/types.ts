export type Category = { id: number; name: string; slug: string };
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