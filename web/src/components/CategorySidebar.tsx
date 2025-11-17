import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories } from "../services/api";
import type { Category } from "../types";
import {
    Gamepad2,
    Monitor,
    Headphones,
    Tag,
    Sparkles,
    Boxes,
    ListTree,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

function CatIcon({ name }: { name?: string }) {
    const key = (name ?? "").toLowerCase();
    const common = "h-4 w-4";

    if (key.includes("consol")) {
        return <Monitor className={common} aria-hidden />;
    }
    if (key.includes("juego")) {
        return <Gamepad2 className={common} aria-hidden />;
    }
    if (key.includes("acces")) {
        return <Headphones className={common} aria-hidden />;
    }
    if (key.includes("oferta") || key.includes("promo")) {
        return <Tag className={common} aria-hidden />;
    }
    return <Sparkles className={common} aria-hidden />;
}

export default function CategorySidebar() {
    const [cats, setCats] = useState<Category[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);     // toggle general (mobile)
    const [expanded, setExpanded] = useState(true);          // toggle de la lista de categorías
    const [loading, setLoading] = useState(true);
    const [sp, setSp] = useSearchParams();
    const getCount = (c: Category) => c.products_count ?? 0;

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
        // Cierra el drawer en mobile
        setDrawerOpen(false);
    };

    return (
        <>
            {/* Botón toggle para mobile */}
            <div className="md:hidden mb-3">
                <button
                    className="w-full text-left px-3 py-2 rounded-xl
                     border border-white/10 bg-white/5 text-white/90 flex items-center justify-between"
                    onClick={() => setDrawerOpen((o) => !o)}
                >
                    <span className="flex items-center gap-2">
                        <ListTree className="h-4 w-4" />
                        <span>Categorías</span>
                    </span>
                    <span>{drawerOpen ? "▲" : "▼"}</span>
                </button>
            </div>

            {/* Sidebar pegado a la izquierda, vertical */}
            <aside
                className={`
                    z-20
                    md:sticky md:top-24 md:self-start md:w-64 md:shrink-0
                    ${drawerOpen ? "block" : "hidden md:block"}
                `}
            >
                <div
                    className="overflow-hidden rounded-[18px]
                     bg-[linear-gradient(180deg,#121A2A_0%,#0B1423_100%)]
                     border border-white/10 text-white/90
                     max-h-[calc(100vh-7rem)] flex flex-col"
                >
                    {/* Header + toggle del menú de categorías */}
                    <button
                        type="button"
                        onClick={() => setExpanded((e) => !e)}
                        className="flex items-center justify-between gap-2 px-4 py-3
                         text-xs font-semibold tracking-widest uppercase text-white/70
                         hover:bg-white/5"
                    >
                        <span className="flex items-center gap-2">
                            <ListTree className="h-4 w-4" />
                            <span>Todas las categorías</span>
                        </span>
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {expanded && (
                        <nav className="p-2 border-t border-white/5 overflow-y-auto">
                            {/* Filtro "Todas" */}
                            <button
                                onClick={() => select(undefined)}
                                className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl
                                    ${active === ""
                                        ? "bg-white/8 text-white"
                                        : "text-white/80 hover:bg-white/5"
                                    }`}
                            >
                                <span className="text-white/80">
                                    <Boxes className="h-4 w-4" />
                                </span>
                                <span className="truncate">Todas</span>

                                {active === "" && (
                                    <span
                                        className="pointer-events-none absolute left-0 my-auto h-5 w-1.5 rounded-r-full
                                            bg-[linear-gradient(180deg,#7C3AED_0%,#06B6D4_100%)]"
                                    />
                                )}
                            </button>

                            {/* Lista de categorías */}
                            {loading ? (
                                <div className="px-3 py-2 text-sm text-white/50">
                                    Cargando…
                                </div>
                            ) : (
                                cats
                                    .filter((c) => getCount(c) > 0)
                                    .map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => select(c.slug)}
                                            className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl
                                                ${active === c.slug
                                                    ? "bg-white/8 text-white"
                                                    : "text-white/80 hover:bg-white/5"
                                                }`}
                                        >
                                            <span className="text-white/80">
                                                <CatIcon name={c.name} />
                                            </span>
                                            <span className="truncate">{c.name}</span>

                                            <span className="ml-auto text-xs tabular-nums text-white/70">
                                                {getCount(c)}
                                            </span>

                                            {active === c.slug && (
                                                <span
                                                    className="pointer-events-none absolute left-0 my-auto h-5 w-1.5 rounded-r-full
                                                    bg-[linear-gradient(180deg,#7C3AED_0%,#06B6D4_100%)]"
                                                />
                                            )}
                                        </button>
                                    ))
                            )}
                        </nav>
                    )}
                </div>
            </aside>
        </>
    );
}
