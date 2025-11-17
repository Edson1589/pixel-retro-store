// src/components/layout/ScrollToTop.tsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

type LocationState = {
    fromCategoryMenu?: boolean;
} | null;

export default function ScrollToTop() {
    const location = useLocation();
    const state = location.state as LocationState;

    const prevPath = useRef(location.pathname);
    const prevSearch = useRef(location.search);

    useEffect(() => {
        // breakpoint aproximado de Tailwind: sm = 640px
        const isMobile = window.innerWidth < 640;
        const offset = isMobile ? 1450 : 770; // 👈 ajusta 950 según tu diseño

        const pathnameChanged = location.pathname !== prevPath.current;
        const searchChanged = location.search !== prevSearch.current;

        // Actualizamos refs para la próxima navegación
        prevPath.current = location.pathname;
        prevSearch.current = location.search;

        if (state?.fromCategoryMenu && location.pathname === '/') {
            window.scrollTo({ top: offset, behavior: 'smooth' });
            return;
        }

        // 2) Si cambió la ruta (/ → /events, / → /cart, etc.) → ir al top
        if (pathnameChanged) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (searchChanged && !pathnameChanged && !state?.fromCategoryMenu) {
            //   // no hacer nada
        }
    }, [location]);

    return null;
}
