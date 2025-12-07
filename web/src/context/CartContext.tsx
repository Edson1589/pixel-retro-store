import { createContext, useContext } from 'react';
import type { CartItem, Product } from '../types';

type Ctx = {
    items: CartItem[];
    add: (p: Product, qty?: number) => void;
    remove: (productId: number) => void;
    clear: () => void;
    total: number;
};

export const CartContext = createContext<Ctx | null>(null);

export function useCart() {
    const v = useContext(CartContext);
    if (!v) throw new Error('useCart out of provider');
    return v;
}
