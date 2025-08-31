import { Link, Outlet, useNavigate } from 'react-router-dom';
import { adminLogout, getToken } from '../../services/adminApi';
import { useState } from 'react';

export default function AdminLayout() {
    const nav = useNavigate();
    const [busy, setBusy] = useState(false);

    const logout = async () => {
        try { setBusy(true); await adminLogout(); nav('/admin/login'); }
        finally { setBusy(false); }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <header className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold">Admin · Pixel Retro</h1>
                <nav className="ml-auto flex gap-3">
                    <Link to="/admin/products" className="underline">Productos</Link>
                    <Link to="/admin/categories" className="underline">Categorías</Link>
                    {!!getToken() && <button onClick={logout} className="underline" disabled={busy}>{busy ? '...' : 'Salir'}</button>}
                </nav>
            </header>
            <Outlet />
        </div>
    );
}
