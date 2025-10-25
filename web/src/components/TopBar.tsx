import { Link } from "react-router-dom";
import type { ReactNode } from "react";

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
    return (
        <header className="sticky top-0 z-40">
            <div className="
        relative h-12 text-white
        bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(2,6,23,0.55),0_10px_24px_-12px_rgba(6,182,212,0.35)]
      ">
                <div className="pointer-events-none absolute inset-x-0 -bottom-[2px] h-[2px] bg-black/35 blur-[2px]" />
                <div className="max-w-6xl mx-auto h-full px-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">{left}</div>

                    <ul className="ml-auto flex items-center text-[13px] font-medium">
                        {items.map((it, idx) => (
                            <li key={`${it.label}-${idx}`} className="flex items-center">
                                {idx > 0 && <span className="opacity-60">·</span>}

                                {it.to ? (
                                    <Link to={it.to} className="relative px-2 opacity-90 hover:opacity-100">
                                        {it.label}
                                        {typeof it.badge === "number" && it.badge > 0 && (
                                            <span className="
                        absolute -right-3 -top-2 min-w-4 px-1 h-4
                        rounded-full grid place-items-center text-[10px]
                        bg-black/85 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]
                      ">
                                                {it.badge}
                                            </span>
                                        )}
                                    </Link>
                                ) : (
                                    <button
                                        disabled={it.disabled}
                                        onClick={it.onClick}
                                        className="px-2 opacity-90 hover:opacity-100 disabled:opacity-50"
                                    >
                                        {it.label}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
}
