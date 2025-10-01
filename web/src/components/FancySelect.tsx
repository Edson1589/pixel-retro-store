import { useEffect, useMemo, useRef, useState } from "react";

export type Option = { label: string; value: string };
type Props = {
    value: string;
    onChange: (v: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string; // permite pasar width, etc.
};

export default function FancySelect({
    value,
    onChange,
    options,
    placeholder = "Seleccionar…",
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState<number>(-1);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const current = useMemo(
        () => options.find((o) => o.value === value),
        [options, value]
    );

    // cerrar al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!open) return;
            const t = e.target as Node;
            if (btnRef.current?.contains(t)) return;
            if (listRef.current?.contains(t)) return;
            setOpen(false);
        };
        window.addEventListener("mousedown", handler);
        return () => window.removeEventListener("mousedown", handler);
    }, [open]);

    // navegación por teclado
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHover((h) => Math.min(options.length - 1, h < 0 ? 0 : h + 1));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setHover((h) => Math.max(0, h < 0 ? options.length - 1 : h - 1));
            }
            if (e.key === "Home") { e.preventDefault(); setHover(0); }
            if (e.key === "End") { e.preventDefault(); setHover(options.length - 1); }
            if (e.key === "Enter" && hover >= 0) {
                e.preventDefault();
                onChange(options[hover].value);
                setOpen(false);
                btnRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, hover, options, onChange]);

    // asegurar que el item hover esté visible
    useEffect(() => {
        if (!open || hover < 0) return;
        const el = listRef.current?.querySelector<HTMLButtonElement>(
            `[data-index="${hover}"]`
        );
        el?.scrollIntoView({ block: "nearest" });
    }, [hover, open]);

    return (
        <div className={`relative ${className ?? ""}`}>
            <button
                ref={btnRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    setOpen((o) => !o);
                    setHover(Math.max(0, options.findIndex((o) => o.value === value)));
                }}
                className="w-full rounded-xl px-3 py-2 pr-9 text-left
                   bg-white/[0.05] text-white/90 border border-white/10
                   focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
            >
                {current ? current.label : <span className="text-white/45">{placeholder}</span>}
                <svg
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? "rotate-180" : ""} opacity-70`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                </svg>
            </button>

            {open && (
                <div
                    ref={listRef}
                    role="listbox"
                    aria-activedescendant={hover >= 0 ? `opt-${hover}` : undefined}
                    className="absolute z-50 mt-2 w-full max-h-64 overflow-auto
                     rounded-xl bg-[#0B1020] text-white border border-white/10
                     shadow-[0_20px_50px_-20px_rgba(2,6,23,0.55)]"
                >
                    {options.map((o, i) => {
                        const selected = o.value === value;
                        return (
                            <button
                                id={`opt-${i}`}
                                key={o.value}
                                data-index={i}
                                role="option"
                                aria-selected={selected}
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(-1)}
                                onClick={() => { onChange(o.value); setOpen(false); btnRef.current?.focus(); }}
                                className={`w-full text-left px-3 py-2 flex items-center gap-2
                            ${selected ? "text-[#06B6D4]" : "text-white/90"}
                            ${hover === i ? "bg-white/[0.08]" : ""}
                           `}
                            >
                                {selected ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80">
                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                ) : (
                                    <span className="w-[14px]" />
                                )}
                                <span className="text-[13px]">{o.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
