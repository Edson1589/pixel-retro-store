import React, { useEffect, useMemo, useState } from 'react';
import { CartContext } from './CartContext';
import type { CartItem, Product } from '../types';

const KEY = 'pixelretro_cart';
const toNumber = (v: number | string) => (typeof v === 'number' ? v : parseFloat(v || '0'));

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    });

    useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

    const add = (p: Product, qty = 1) => {
        setItems(prev => {
            const i = prev.findIndex(x => x.product.id === p.id);
            if (i >= 0) {
                const next = [...prev];
                next[i] = { ...next[i], quantity: next[i].quantity + qty };
                return next;
            }
            return [...prev, { product: p, quantity: qty }];
        });
    };

    const remove = (id: number) => setItems(prev => prev.filter(x => x.product.id !== id));
    const clear = () => setItems([]);
    const total = useMemo(() => items.reduce((a, b) => a + toNumber(b.product.price) * b.quantity, 0), [items]);

    return (
        <CartContext.Provider value={{ items, add, remove, clear, total }}>
            {children}
        </CartContext.Provider>
    );
}
