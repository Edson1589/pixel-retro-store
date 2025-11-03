import Modal from '../../components/ui/Modals';

export default function SuccessModal({
    open,
    onClose,
    message,
}: { open: boolean; onClose: () => void; message: string }) {
    return (
        <Modal open={open} onClose={onClose} title="¡Registro exitoso!" size="sm"
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
            <p className="text-white/85 leading-relaxed">
                {message || 'Registro recibido. Te contactaremos para confirmar.'}
            </p>
        </Modal>
    );
}
