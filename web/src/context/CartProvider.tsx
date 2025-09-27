import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CartContext } from './CartContext';
import type { CartItem, Product } from '../types';
import { useCustomerAuth } from './CustomerAuthContext';
import { cartGet, cartPut } from '../services/cartApi';
import type { CartPutItem, CartGetItem, CartResponse, CartProductLite } from '../services/cartApi';

const parseNum = (v: number | string) =>
  typeof v === 'number' ? v : parseFloat(v || '0');

const keyFor = (userId?: number | null) =>
  `pixelretro_cart_${userId ?? 'guest'}`;

const toFullProduct = (
  lite: CartProductLite | undefined,
  fallbackId: number,
  unit_price: number
): Product => {
  const p =
    lite ?? { id: fallbackId, name: 'Producto', price: unit_price, image_url: null };
  return {
    id: p.id,
    category_id: null,
    name: p.name,
    slug: '',
    sku: null,
    description: null,
    price: p.price,
    stock: 0,
    condition: 'new',
    is_unique: false,
    image_url: p.image_url ?? null,
    status: 'active',
  };
};

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
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function mergeItems(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<number, CartItem>();
  for (const it of base) map.set(it.product.id, { ...it });
  for (const it of incoming) {
    const cur = map.get(it.product.id);
    if (cur) {
      map.set(it.product.id, { ...cur, quantity: cur.quantity + it.quantity });
    } else {
      map.set(it.product.id, { ...it });
    }
  }
  return Array.from(map.values());
}

const toPutLines = (items: CartItem[]): CartPutItem[] =>
  items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }));

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCustomerAuth();
  const storageKey = keyFor(user?.id);

  const [items, setItems] = useState<CartItem[]>(() => readCart(storageKey));
  const [cartError, setCartError] = useState<string | null>(null);

  const prevKeyRef = useRef(storageKey);
  const justMigratedRef = useRef(false);

  useEffect(() => {
    if (prevKeyRef.current === storageKey) return;

    const prevKey = prevKeyRef.current;
    const nextKey = storageKey;

    const prevItems = readCart(prevKey);
    const nextItems = readCart(nextKey);

    let resolved: CartItem[];

    if (prevKey.endsWith('_guest') && !nextKey.endsWith('_guest')) {
      resolved = mergeItems(nextItems, prevItems);
    } else {
      resolved = nextItems;
    }

    writeCart(nextKey, resolved);
    justMigratedRef.current = true;
    setItems(resolved);
    prevKeyRef.current = nextKey;

    if (prevKey.endsWith('_guest')) {
      try {
        localStorage.removeItem(prevKey);
      } catch {
        // ignore
      }
    }

    (async () => {
      if (nextKey.endsWith('_guest')) return;
      try {
        if (prevKey.endsWith('_guest')) {
          await cartPut(toPutLines(resolved));
          return;
        }
        let server: CartResponse;
        try {
          server = (await cartGet()) as CartResponse;
        } catch {
          server = { items: [] };
        }

        const serverItems = server.items.map((i: CartGetItem) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        }));
        const localItems = toPutLines(resolved);

        const localEmpty = localItems.length === 0;
        const serverEmpty = serverItems.length === 0;

        if (!localEmpty && serverEmpty) {
          await cartPut(localItems);
        } else if (localEmpty && !serverEmpty) {
          const rebuilt: CartItem[] = server.items.map((si: CartGetItem) => ({
            product: toFullProduct(si.product, si.product_id, si.unit_price),
            quantity: si.quantity,
          }));

          setItems(rebuilt);
          writeCart(nextKey, rebuilt);
        } else if (!localEmpty && !serverEmpty) {
          const map = new Map<number, number>();
          for (const it of serverItems) map.set(it.product_id, it.quantity);
          for (const it of localItems)
            map.set(it.product_id, (map.get(it.product_id) ?? 0) + it.quantity);
          const mergedArr = Array.from(map.entries()).map(([product_id, quantity]) => ({
            product_id,
            quantity,
          }));
          await cartPut(mergedArr);
        }
      } catch {
        // ignore
      }
    })();
  }, [storageKey]);

  useEffect(() => {
    if (justMigratedRef.current) {
      justMigratedRef.current = false;
      return;
    }
    writeCart(storageKey, items);
  }, [storageKey, items]);

useEffect(() => {
  if (!user?.id) return;
  if (justMigratedRef.current) return;
  const h = setTimeout(() => {
    cartPut(toPutLines(items)).catch(() => {});
  }, 300);
  return () => clearTimeout(h);
}, [user?.id, items]);

const add = (p: Product, qty = 1) => {
  setItems((prev) => {
    const i = prev.findIndex((x) => x.product.id === p.id);
    const currentQty = i >= 0 ? prev[i].quantity : 0;
    const newQty = currentQty + qty;

    
    if (p.stock > 0 && newQty > p.stock) {
      setCartError("stock_unavailable");
      setTimeout(() => setCartError(null), 4000); // limpiar después de 3s
      return prev; // 👈 mantenemos el carrito igual
    }

    if (i >= 0) {
      const next = [...prev];
      next[i] = { ...next[i], quantity: newQty };
      return next;
    }

    return [...prev, { product: p, quantity: qty }];
  });
};


  const remove = (id: number) =>
    setItems((prev) => prev.filter((x) => x.product.id !== id));

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((a, b) => a + parseNum(b.product.price) * b.quantity, 0),
    [items]
  );

  useEffect(() => {
    const onClear = () => setItems([]);
    window.addEventListener('cart:clear', onClear);
    return () => window.removeEventListener('cart:clear', onClear);
  }, []);

  return (
    <CartContext.Provider
      value={{ items, addItem: add, remove, clear, total, cartError }}
    >
      {children}
    </CartContext.Provider>
  );
}
