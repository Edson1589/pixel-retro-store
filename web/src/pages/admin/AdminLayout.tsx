import { Outlet, useNavigate } from 'react-router-dom';
import { adminLogout, getToken } from '../../services/adminApi';
import { useState } from 'react';
import TopBar from '../../components/TopBar';

export default function AdminLayout() {
    const nav = useNavigate();
    const [busy, setBusy] = useState(false);

    const logout = async () => {
        try { setBusy(true); await adminLogout(); nav('/admin/login'); }
        finally { setBusy(false); }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#07101B]">
            {/* textura sutil opcional */}
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]
        bg-[radial-gradient(#ffffff_1px,transparent_1.2px)] [background-size:16px_16px]
        [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]" />

            {/* glows opcionales */}
            <div className="pointer-events-none absolute -z-10 top-1/2 left-1/2 h-[720px] w-[720px]
        -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl
        bg-[radial-gradient(closest-side,rgba(124,58,237,0.28),transparent_70%)]" />
            <div className="pointer-events-none absolute -z-10 top-10 right-16 h-[380px] w-[380px]
        rounded-full blur-3xl
        bg-[radial-gradient(closest-side,rgba(6,182,212,0.18),transparent_70%)]" />

            <TopBar
                left={
                    <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-5 w-5 rounded-[3px] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 7h4V5h6v2h4v6h-2v4h-4v-2h-4v2H7v-4H5z" fill="currentColor" />
                            </svg>
                        </span>
                        <span className="text-sm text-white"><strong>Admin · Pixel Retro</strong></span>
                    </div>
                }
                items={[
                    { label: 'Eventos', to: '/admin/events' },
                    { label: 'Productos', to: '/admin/products' },
                    { label: 'Categorías', to: '/admin/categories' },
                    ...(getToken()
                        ? [{ label: busy ? '...' : 'Salir', onClick: () => void logout(), disabled: busy }]
                        : []),
                ]}
            />

            <div className="max-w-6xl mx-auto p-4">
                <Outlet />
            </div>
        </div>
    );
}

