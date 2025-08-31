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
