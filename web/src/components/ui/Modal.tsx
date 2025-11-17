import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidthClass?: string;
};

export default function Modal({
    open,
    onClose,
    title,
    children,
    maxWidthClass = 'max-w-lg',
}: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        const prev = document.body.style.overflow;
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={`w-full ${maxWidthClass}
        rounded-2xl
        bg-[#050814] border border-white/10 text-white
        shadow-[0_40px_120px_-30px_rgba(2,6,23,0.9)]
        flex flex-col
        max-h-[min(100vh-3rem,720px)]`}
                >
                    {/* header fijo */}
                    <div
                        className="flex items-center gap-2 p-4 border-b border-white/10
              bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]"
                    >
                        <h3 className="text-[15px] font-semibold text-white/90">{title}</h3>
                        <button
                            onClick={onClose}
                            className="ml-auto text-sm px-3 py-1.5 rounded-lg
                 bg-white/10 hover:bg-white/15 border border-white/10
                 focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]"
                        >
                            Cerrar
                        </button>
                    </div>

                    {/* contenido scrollable */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {children}
                    </div>
                </div>
            </div>

        </div>,
        document.body
    );
}
