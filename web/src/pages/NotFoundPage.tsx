import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen text-white flex items-start justify-center px-4 mt-6">
            <div className="w-full max-w-md rounded-[22px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_-25px_rgba(2,6,23,0.8)] relative overflow-hidden">
                <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-500/25 blur-3 opacity-70" />

                <div className="relative space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[linear-gradient(135deg,#06B6D4_0%,#7C3AED_100%)] shadow-[0_12px_30px_-14px_rgba(6,182,212,0.8)] mx-auto">
                        <Ghost className="h-7 w-7 text-white" />
                    </div>

                    <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-white/50">
                            Error 404
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
                            Nivel no encontrado
                        </h1>
                        <p className="mt-2 text-sm text-white/70">
                            Parece que esta ruta no existe o fue movida.
                            No te preocupes, aún puedes seguir explorando la Pixel Retro Store.
                        </p>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-center gap-2">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-medium
                         bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                         hover:brightness-110 shadow-[0_12px_30px_-12px_rgba(124,58,237,0.85)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver al inicio</span>
                        </Link>
                    </div>

                    <p className="mt-3 text-[11px] text-white/45">
                        Tip: verifica la URL o navega desde el menú principal para encontrar tu próximo loot retro.
                    </p>
                </div>
            </div>
        </div>
    );
}
