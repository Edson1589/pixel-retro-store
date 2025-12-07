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
        const pathnameChanged = location.pathname !== prevPath.current;
        const searchChanged = location.search !== prevSearch.current;

        prevPath.current = location.pathname;
        prevSearch.current = location.search;

        if (pathnameChanged) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (searchChanged && !pathnameChanged && !state?.fromCategoryMenu) {
            //
        }
    }, [location]);

    return null;
}
