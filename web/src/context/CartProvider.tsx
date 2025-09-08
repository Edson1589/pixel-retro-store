import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CartContext } from './CartContext';
import type { CartItem, Product } from '../types';
import { useCustomerAuth } from './CustomerAuthContext';

// Helpers
const parseNum = (v: number | string) => (typeof v === 'number' ? v : parseFloat(v || '0'));
const keyFor = (userId?: number | null) => `pixelretro_cart_${userId ?? 'guest'}`;

function readCart(storageKey: string): CartItem[] {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr
            .filter((x) => x && x.product && typeof x.quantity === 'number')
            .map((x) => ({
                product: x.product as Product,
                quantity: Number.isFinite(x.quantity) ? x.quantity : 1,
            }));
    } catch {
        return [];
    }
}

function writeCart(storageKey: string, items: CartItem[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch (e) { void e; }
}

function mergeItems(base: CartItem[], incoming: CartItem[]): CartItem[] {
    // base = items ya existentes del usuario
    // incoming = items del invitado (a fusionar)
    const map = new Map<number, CartItem>();
    for (const it of base) map.set(it.product.id, { ...it });
    for (const it of incoming) {
        const cur = map.get(it.product.id);
        if (cur) map.set(it.product.id, { ...cur, quantity: cur.quantity + it.quantity });
        else map.set(it.product.id, { ...it });
    }
    return Array.from(map.values());
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useCustomerAuth();
    const storageKey = keyFor(user?.id);

    // Estado + refs para controlar migración/persistencia
    const [items, setItems] = useState<CartItem[]>(() => readCart(storageKey));
    const prevKeyRef = useRef(storageKey);
    const justMigratedRef = useRef(false);

    // 1) MIGRACIÓN DE CLAVE (guest→user, user→guest, userA→userB)
    useEffect(() => {
        if (prevKeyRef.current === storageKey) return;

        const prevKey = prevKeyRef.current;
        const nextKey = storageKey;

        const prevItems = readCart(prevKey);
        const nextItems = readCart(nextKey);

        let resolved: CartItem[];

        // Invitado -> Usuario: fusiona "invitado" dentro del carrito del usuario
        if (prevKey.endsWith('_guest') && !nextKey.endsWith('_guest')) {
            resolved = mergeItems(nextItems, prevItems);
        } else {
            // Cualquier otro cambio: usa el carrito ya guardado del nuevo key
            resolved = nextItems;
        }

        // Escribe de inmediato en la nueva clave y marca que acabamos de migrar
        writeCart(nextKey, resolved);
        justMigratedRef.current = true;

        // Actualiza estado y referencias
        setItems(resolved);
        prevKeyRef.current = nextKey;

        // Limpia el key viejo si era invitado (no acumular basura)
        if (prevKey.endsWith('_guest')) {
            try { localStorage.removeItem(prevKey); } catch (e) { void e; }
        }
    }, [storageKey]);

    // 2) PERSISTENCIA NORMAL (evita escribir en el primer ciclo tras migrar)
    useEffect(() => {
        if (justMigratedRef.current) {
            justMigratedRef.current = false;
            return;
        }
        writeCart(storageKey, items);
    }, [storageKey, items]);

    // API
    const add = (p: Product, qty = 1) => {
        setItems((prev) => {
            const i = prev.findIndex((x) => x.product.id === p.id);
            if (i >= 0) {
                const next = [...prev];
                next[i] = { ...next[i], quantity: next[i].quantity + qty };
                return next;
            }
            return [...prev, { product: p, quantity: qty }];
        });
    };

    const remove = (id: number) => setItems((prev) => prev.filter((x) => x.product.id !== id));
    const clear = () => setItems([]);

    const total = useMemo(
        () => items.reduce((a, b) => a + parseNum(b.product.price) * b.quantity, 0),
        [items]
    );

    // Listener global (p.ej., en logout)
    useEffect(() => {
        const onClear = () => setItems([]);
        window.addEventListener('cart:clear', onClear);
        return () => window.removeEventListener('cart:clear', onClear);
    }, []);

    return (
        <CartContext.Provider value={{ items, add, remove, clear, total }}>
            {children}
        </CartContext.Provider>
    );
}
