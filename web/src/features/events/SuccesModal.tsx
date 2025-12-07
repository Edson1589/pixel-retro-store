import Modal from '../../components/ui/Modals';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessModal({
    open,
    onClose,
    message,
}: { open: boolean; onClose: () => void; message: string }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="¡Registro exitoso!"
            size="sm"
            footer={
                <div className="text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-[linear-gradient(90deg,#06B6D4_0%,#7C3AED_100%)]
            text-white font-medium hover:brightness-110"
                    >
                        Entendido
                    </button>
                </div>
            }
        >
            <div className="space-y-3 text-white">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div className="text-sm">
                        <p className="text-white/90 font-semibold">¡Todo listo!</p>
                        <p className="text-white/65 text-xs">
                            Guardamos tu registro para este evento. Te enviaremos más detalles por correo si es necesario.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-white/85 leading-relaxed">
                    {message || 'Registro recibido. Te contactaremos para confirmar.'}
                </p>
            </div>
        </Modal>
    );

}
