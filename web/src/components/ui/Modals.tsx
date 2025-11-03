import { useEffect } from 'react';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={`w-full ${sizeMap[size]} rounded-2xl overflow-hidden
            border border-white/10 bg-[#0B1220] text-white
            shadow-[0_30px_80px_-25px_rgba(2,6,23,0.65)]`}
                >
                    <div className="px-4 py-3 border-b border-white/10 flex items-center">
                        <h3 className="text-[15px] font-semibold text-white/90">{title}</h3>
                        <button
                            onClick={onClose}
                            className="ml-auto px-2 py-1 rounded-md text-white/70 hover:bg-white/10"
                            aria-label="Cerrar modal"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-4">
                        {children}
                    </div>
                    {footer && (
                        <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02]">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
