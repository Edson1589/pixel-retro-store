import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type Item = {
    label: string;
    to?: string;
    onClick?: () => void;
    badge?: number;
    disabled?: boolean;
};

export default function TopBar({
    left,
    items,
}: {
    left: ReactNode;
    items: Item[];
}) {
    const [open, setOpen] = useState(false);
    const loc = useLocation();

    // Cerrar menú al cambiar de ruta
    useEffect(() => {
        setOpen(false);
    }, [loc.pathname]);

    // Cerrar con ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <header className="sticky top-0 z-40">
            <div
                className="
        relative h-12 text-white
        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(2,6,23,0.55),0_10px_24px_-12px_rgba(6,182,212,0.35)]
      "
            >
                <div className="pointer-events-none absolute inset-x-0 -bottom-[2px] h-[2px] bg-black/35 blur-[2px]" />
                <div className="max-w-6xl mx-auto h-full px-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">{left}</div>

                    {/* Desktop nav */}
                    <ul className="ml-auto hidden md:flex items-center text-[13px] font-medium">
                        {items.map((it, idx) => (
                            <li key={`${it.label}-${idx}`} className="flex items-center">
                                {idx > 0 && <span className="opacity-60">·</span>}

                                {it.to ? (
                                    <Link
                                        to={it.to}
                                        className="relative px-2 opacity-90 hover:opacity-100"
                                    >
                                        {it.label}
                                        {typeof it.badge === "number" && it.badge > 0 && (
                                            <span
                                                className="
                          absolute -right-3 -top-2 min-w-4 px-1 h-4
                          rounded-full grid place-items-center text-[10px]
                          bg-black/85 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]
                        "
                                            >
                                                {it.badge}
                                            </span>
                                        )}
                                    </Link>
                                ) : it.onClick ? (
                                    <button
                                        disabled={it.disabled}
                                        onClick={it.onClick}
                                        className="px-2 opacity-90 hover:opacity-100 disabled:opacity-50"
                                    >
                                        {it.label}
                                    </button>
                                ) : (
                                    <span className="px-2 opacity-75">{it.label}</span>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className="ml-auto md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md
                       bg-white/10 hover:bg-white/15 outline-none ring-0
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]
                       transition"
                        aria-label="Abrir menú"
                        aria-controls="mobile-menu"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <span className="sr-only">Abrir menú</span>
                        {/* Icono hamburguesa / X */}
                        <svg
                            className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            {open ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile panel */}
                <div
                    id="mobile-menu"
                    className={`
            md:hidden absolute left-0 right-0 top-12
            ${open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"}
            transition duration-200
          `}
                >
                    {/* Fondo con blur + borde superior */}
                    <div
                        className="
              bg-[#07101B]/92 backdrop-blur
              border-t border-white/10
              shadow-[0_12px_28px_-12px_rgba(6,182,212,0.35)]
              rounded-b-xl
            "
                    >
                        <nav className="px-3 py-2">
                            <ul className="flex flex-col text-sm">
                                {items.map((it, idx) => {
                                    const base =
                                        "w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition";
                                    return (
                                        <li key={`m-${it.label}-${idx}`} className="relative">
                                            {it.to ? (
                                                <Link to={it.to} className={`${base} block`}>
                                                    <span className="opacity-95">{it.label}</span>
                                                    {typeof it.badge === "number" && it.badge > 0 && (
                                                        <span
                                                            className="
                                absolute right-3 top-1/2 -translate-y-1/2
                                min-w-5 h-5 px-1 grid place-items-center
                                text-[11px] rounded-full bg-white/10
                                shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
                              "
                                                        >
                                                            {it.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ) : it.onClick ? (
                                                <button
                                                    disabled={it.disabled}
                                                    onClick={it.onClick}
                                                    className={`${base} disabled:opacity-50`}
                                                >
                                                    <span className="opacity-95">{it.label}</span>
                                                </button>
                                            ) : (
                                                <span className={`${base} opacity-75`}>{it.label}</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
