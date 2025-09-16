import { createContext, useContext, useEffect, useState } from 'react';
import type { CustomerUser } from '../services/customerApi';
import {
    customerLogin,
    customerLogout,
    customerMe,
    customerRegister,
    setCustomerToken,
    clearCustomerToken,
    getCustomerToken,
} from '../services/customerApi';

type AuthCtx = {
    user: CustomerUser | null;
    loading: boolean;
    login(email: string, password: string): Promise<void>;
    register(p: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
        address?: string;
    }): Promise<void>;
    logout(): Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<CustomerUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = getCustomerToken();
        if (!t) { setLoading(false); return; }
        customerMe()
            .then(setUser)
            .catch(() => clearCustomerToken())
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        const r = await customerLogin(email, password);
        setCustomerToken(r.token);
        setUser(r.user);
    };

    const register = async (p: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
        address?: string;
    }) => {
        const r = await customerRegister(p);
        setCustomerToken(r.token);
        setUser(r.user);
    };

    const logout = async () => {
        try { await customerLogout(); } catch (e) { void e; }
        clearCustomerToken();
        setUser(null);

        try { localStorage.removeItem('pixelretro_cart_guest'); } catch (e) { void e; }
        window.dispatchEvent(new CustomEvent('cart:clear'));
    };


    return (
        <Ctx.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </Ctx.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerAuth() {
    const v = useContext(Ctx);
    if (!v) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
    return v;
}
