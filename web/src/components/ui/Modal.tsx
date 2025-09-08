import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; maxWidthClass?: string; };

export default function Modal({ open, onClose, title, children, maxWidthClass = 'max-w-lg' }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        const prev = document.body.style.overflow;
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open, onClose]);

    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div role="dialog" aria-modal="true" className={`w-full ${maxWidthClass} bg-white rounded-2xl shadow-xl border overflow-hidden`}>
                    <div className="flex items-center gap-2 border-b p-3">
                        <h3 className="font-semibold">{title}</h3>
                        <button onClick={onClose} className="ml-auto text-sm underline">Cerrar</button>
                    </div>
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
}
