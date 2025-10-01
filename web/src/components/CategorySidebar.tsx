import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories } from "../services/api";
import type { Category } from "../types";

function CatIcon({ name }: { name?: string }) {
    const key = (name ?? "").toLowerCase();
    const common = "h-4 w-4";
    // íconos inline (sin librerías)
    if (key.includes("consol")) {
        return (
            <svg viewBox="0 0 24 24" className={common} aria-hidden>
                <path
                    d="M6 10h12a3 3 0 0 1 0 6h-1.2a2 2 0 0 1-1.6-.8l-.8-1.2H9.6l-.8 1.2a2 2 0 0 1-1.6.8H6a3 3 0 0 1 0-6Zm2 0V8h8v2"
                    fill="currentColor"
                    opacity=".15"
                />
                <path
                    d="M6 10h12a3 3 0 0 1 0 6h-1.2a2 2 0 0 1-1.6-.8l-.8-1.2H9.6l-.8 1.2a2 2 0 0 1-1.6.8H6a3 3 0 0 1 0-6Zm4.5 1.5h-3m1.5-1.5v3m5 0h.01m2 0h.01"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        );
    }
    if (key.includes("juego")) {
        return (
            <svg viewBox="0 0 24 24" className={common} aria-hidden>
                <path d="M4 8h16v8H4z" fill="currentColor" opacity=".15" />
                <path
                    d="M6 8h12a2 2 0 0 1 2 2v4H4v-4a2 2 0 0 1 2-2Zm4 2H8m1 1v2m6-2h.01m2 0h.01"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        );
    }
    if (key.includes("acces")) {
        return (
            <svg viewBox="0 0 24 24" className={common} aria-hidden>
                <path d="M7 7h10v10H7z" fill="currentColor" opacity=".15" />
                <path
                    d="M8 8h8v8H8zM12 4v4m0 8v4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        );
    }
    if (key.includes("oferta") || key.includes("promo")) {
        return (
            <svg viewBox="0 0 24 24" className={common} aria-hidden>
                <path d="M5 12 12 5l7 7-7 7-7-7Z" fill="currentColor" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden>
            <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
    );
}

export default function CategorySidebar() {
    const [cats, setCats] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sp, setSp] = useSearchParams();

    const active = sp.get("category") ?? "";

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                setCats(await fetchCategories());
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const select = (slug?: string) => {
        const next = new URLSearchParams(sp);
        if (!slug) next.delete("category");
        else next.set("category", slug);
        next.delete("page");
        setSp(next, { replace: true });
        setOpen(false);
    };

    return (
        <>
            {/* Toggle móvil */}
            <div className="md:hidden mb-3">
                <button
                    className="w-full text-left px-3 py-2 rounded-xl
                     border border-white/10 bg-white/5 text-white/90"
                    onClick={() => setOpen((o) => !o)}
                >
                    ☰ Categorías {open ? "▲" : "▼"}
                </button>
            </div>

            <aside className={`md:block md:w-64 md:shrink-0 ${open ? "block" : "hidden"}`}>
                <div
                    className="overflow-hidden rounded-[18px]
                     bg-[linear-gradient(180deg,#121A2A_0%,#0B1423_100%)]
                     border border-white/10 text-white/90"
                >
                    <div className="px-4 py-3 text-xs font-semibold tracking-widest uppercase text-white/70">
                        Categorías
                    </div>

                    <nav className="p-2">
                        {/* Todas */}
                        <button
                            onClick={() => select(undefined)}
                            className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl
                         ${active === "" ? "bg-white/8 text-white" : "text-white/80 hover:bg-white/5"}`}
                        >
                            <span className="text-white/80">
                                <CatIcon />
                            </span>
                            <span className="truncate">Todas</span>
                            {active === "" && (
                                <span className="pointer-events-none absolute left-0 my-auto h-5 w-1.5 rounded-r-full
                                 bg-[linear-gradient(180deg,#7C3AED_0%,#06B6D4_100%)]" />
                            )}
                        </button>

                        {/* Dinámicas */}
                        {loading ? (
                            <div className="px-3 py-2 text-sm text-white/50">Cargando…</div>
                        ) : (
                            cats.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => select(c.slug)}
                                    className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl
                              ${active === c.slug ? "bg-white/8 text-white" : "text-white/80 hover:bg-white/5"}`}
                                >
                                    <span className="text-white/80">
                                        <CatIcon name={c.name} />
                                    </span>
                                    <span className="truncate">{c.name}</span>
                                    {active === c.slug && (
                                        <span className="pointer-events-none absolute left-0 my-auto h-5 w-1.5 rounded-r-full
                                     bg-[linear-gradient(180deg,#7C3AED_0%,#06B6D4_100%)]" />
                                    )}
                                </button>
                            ))
                        )}
                    </nav>
                </div>
            </aside>
        </>
    );
}
