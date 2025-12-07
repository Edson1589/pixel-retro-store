import {
    Gamepad2,
    ShoppingBag,
    CalendarClock,
    Sparkles,
    Monitor,
    Joystick,
    Headphones,
    Users,
    Store,
    ShieldCheck,
    Truck,
    BadgeCheck,
    Clock3,
    MapPin,
    PhoneCall,
    Mail,
    Instagram,
    Twitch,
    Star,
} from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-[#07101B] text-white">
            <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-10">
                <section
                    className="rounded-[20px] px-6 sm:px-8 py-6 sm:py-7
                     bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                     shadow-[0_20px_60px_-20px_rgba(6,182,212,0.35)]
                     border border-white/10"
                >
                    <div className="flex flex-col items-center text-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] tracking-[0.18em] uppercase text-white/80">
                            <Gamepad2 className="h-3 w-3" />
                            <span>Pixel Retro Store · Modo nostalgia ON</span>
                        </span>

                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider">
                            Quiénes somos en Pixel Retro Store
                        </h1>

                        <p className="mt-1 text-white/90 text-sm max-w-2xl">
                            Somos una tienda especializada en consolas, juegos y accesorios retro. Rescatamos
                            hardware original, lo restauramos con cariño y lo preparamos para que vuelvas a
                            sentir el &quot;Press Start&quot; como la primera vez.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    const target = document.getElementById('about-why');
                                    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="px-4 py-2 rounded-full bg-white text-[#07101B] font-semibold text-sm
                           shadow-[0_8px_24px_-8px_rgba(2,6,23,0.35)] hover:brightness-105
                           inline-flex items-center gap-2"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span>Ver por qué elegirnos</span>
                            </button>

                            <button
                                onClick={() => window.location.assign('/events')}
                                className="px-4 py-2 rounded-full border border-white/60 text-sm font-medium
                           bg-white/0 text-white hover:bg-white/10 transition
                           inline-flex items-center gap-2"
                            >
                                <CalendarClock className="h-4 w-4" />
                                <span>Ver eventos y torneos</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section id="about-why" className="text-white space-y-6">
                    <div className="rounded-[20px] border border-white/10 bg-white/5 px-6 py-5 space-y-3">
                        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#06B6D4]" />
                            <span>¿Por qué jugar con Pixel Retro Store?</span>
                        </h2>

                        <p className="text-sm text-white/75 max-w-2xl">
                            No somos solo una tienda: somos un checkpoint para coleccionistas, nostálgicos
                            y nuevos jugadores que quieren vivir la historia del gaming con hardware real.
                        </p>

                        <ul className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-white/80">
                            <li className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 mt-[2px] text-[#06B6D4]" />
                                <span>
                                    <strong>Piezas seleccionadas:</strong> Consolas y juegos probados, limpiados y
                                    listos para conectar y jugar, no solo para exhibir.
                                </span>
                            </li>

                            <li className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 mt-[2px] text-[#06B6D4]" />
                                <span>
                                    <strong>Retro con garantía:</strong> Soporte y acompañamiento para que tus
                                    clásicos duren muchos años más.
                                </span>
                            </li>

                            <li className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 mt-[2px] text-[#06B6D4]" />
                                <span>
                                    <strong>Stock rotativo:</strong> Lotes limitados que cambian constantemente;
                                    si lo ves y te gusta, es tu momento de loot.
                                </span>
                            </li>

                            <li className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 mt-[2px] text-[#06B6D4]" />
                                <span>
                                    <strong>Comunidad activa:</strong> Torneos, retos y eventos para que no juegues solo.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-[#06B6D4]" />
                                <span>Consolas legendarias</span>
                            </h3>
                            <p className="text-xs text-white/70">
                                Desde NES y SNES hasta portátiles clásicas. Equipos revisados, calibrados y
                                listos para ser el centro de tu setup retro.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                <Joystick className="h-4 w-4 text-[#06B6D4]" />
                                <span>Juegos que marcaron época</span>
                            </h3>
                            <p className="text-xs text-white/70">
                                Cartuchos y discos originales, ediciones especiales y títulos que definieron
                                generaciones completas de jugadores.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                <Headphones className="h-4 w-4 text-[#06B6D4]" />
                                <span>Accesorios y coleccionables</span>
                            </h3>
                            <p className="text-xs text-white/70">
                                Mandos, cables, stands, figuras y detalles para construir el rincón retro
                                que siempre quisiste tener.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="text-white space-y-4">
                    <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-[#06B6D4]" />
                        <h2 className="text-lg font-semibold tracking-wide">Cómo nació Pixel Retro Store</h2>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 space-y-4 text-sm">
                        <p className="text-white/80">
                            Pixel Retro Store nace de una mezcla peligrosa: amor por el coleccionismo, nostalgia
                            por los 8/16 bits y la necesidad de evitar que más consolas terminen olvidadas en cajas
                            o bodegas húmedas.
                        </p>

                        <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
                            <div className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-3 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-white/60 text-[11px] uppercase tracking-[0.16em]">
                                    <Clock3 className="h-3 w-3" />
                                    <span>Primer checkpoint</span>
                                </div>
                                <p className="text-white/80">
                                    Todo empezó restaurando consolas de amigos y familia, documentando cada arreglo y
                                    probando cada juego &quot;por si acaso&quot;.
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-3 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-white/60 text-[11px] uppercase tracking-[0.16em]">
                                    <Star className="h-3 w-3 text-yellow-300" />
                                    <span>De hobby a tienda</span>
                                </div>
                                <p className="text-white/80">
                                    El catálogo creció, llegaron pedidos, y decidimos convertir esa pasión en una
                                    experiencia de compra retro completa.
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-3 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-white/60 text-[11px] uppercase tracking-[0.16em]">
                                    <Users className="h-3 w-3 text-[#06B6D4]" />
                                    <span>Comunidad</span>
                                </div>
                                <p className="text-white/80">
                                    Hoy mezclamos tienda, comunidad y eventos para que los juegos clásicos sigan vivos
                                    en nuevas partidas.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="text-white space-y-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[#06B6D4]" />
                        <h2 className="text-lg font-semibold tracking-wide">
                            Cómo trabajamos cada pieza
                        </h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4 text-xs sm:text-sm">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Gamepad2 className="h-4 w-4 text-cyan-300" />
                                <span className="font-semibold">1. Encontramos</span>
                            </div>
                            <p className="text-white/70">
                                Rescatamos consolas, juegos y accesorios de colecciones, lotes y mercados locales.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                <span className="font-semibold">2. Restauramos</span>
                            </div>
                            <p className="text-white/70">
                                Limpieza interna/externa, cambio de piezas necesarias y pruebas de funcionamiento.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-violet-300" />
                                <span className="font-semibold">3. Curamos catálogo</span>
                            </div>
                            <p className="text-white/70">
                                Clasificamos por condición (nuevo, usado, reacondicionado) y comprobamos autenticidad.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-amber-300" />
                                <span className="font-semibold">4. Empaquetamos y enviamos</span>
                            </div>
                            <p className="text-white/70">
                                Empaque seguro, cables probados y todo listo para que solo conectes y juegues.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="text-white space-y-4">
                    <div className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-[#06B6D4]" />
                        <h2 className="text-lg font-semibold tracking-wide">Nuestros pilares</h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 text-xs sm:text-sm">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                            <h3 className="flex items-center gap-2 font-semibold mb-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                <span>Autenticidad</span>
                            </h3>
                            <p className="text-white/70">
                                Nos enfocamos en hardware y juegos originales, indicando siempre la condición real
                                de cada pieza.
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                            <h3 className="flex items-center gap-2 font-semibold mb-1">
                                <Clock3 className="h-4 w-4 text-amber-300" />
                                <span>Larga vida al retro</span>
                            </h3>
                            <p className="text-white/70">
                                Buscamos que cada compra sea una inversión en recuerdos y nuevas horas de juego.
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                            <h3 className="flex items-center gap-2 font-semibold mb-1">
                                <Users className="h-4 w-4 text-cyan-300" />
                                <span>Comunidad</span>
                            </h3>
                            <p className="text-white/70">
                                Torneos, eventos y retos para que siempre tengas con quién compartir tus partidas.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="text-white">
                    <div className="rounded-[18px] border border-white/10 bg-[#050814] px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#06B6D4]" />
                                <span>Eventos, torneos y noches retro</span>
                            </h2>

                            <p className="mt-1 text-xs text-white/70 max-w-xl">
                                Organizamos torneos, quedadas y experiencias temáticas para que compartas tu
                                pasión con otros jugadores, intercambies juegos y sumes nuevas historias a tu memoria gamer.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.assign('/events')}
                            className="self-start md:self-auto px-4 py-2 text-sm rounded-full
                         bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                         text-white font-medium hover:brightness-110"
                        >
                            Ver próximos eventos
                        </button>
                    </div>
                </section>

                <section className="text-white space-y-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#06B6D4]" />
                        <h2 className="text-lg font-semibold tracking-wide">Dónde encontrarnos</h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 text-xs sm:text-sm">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-2">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <Store className="h-4 w-4 text-cyan-300" />
                                <span>Contacto</span>
                            </h3>
                            <p className="text-white/75">
                                ¿Buscas algo muy específico o quieres vender tu colección? Escríbenos y vemos
                                cómo ayudarte.
                            </p>
                            <ul className="mt-2 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <PhoneCall className="h-3.5 w-3.5 text-white/60" />
                                    <span>+591 XXX XXX XX (ejemplo)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-white/60" />
                                    <span>contacto@pixelretrostore.com (ejemplo)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-2">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <Users className="h-4 w-4 text-violet-300" />
                                <span>Redes & Comunidad</span>
                            </h3>
                            <p className="text-white/75">
                                Síguenos para ver nuevos lotes, anuncios de torneos y contenido retro diario.
                            </p>
                            <ul className="mt-2 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <Instagram className="h-3.5 w-3.5 text-pink-300" />
                                    <span>@pixelretrostore (ejemplo)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Twitch className="h-3.5 w-3.5 text-purple-300" />
                                    <span>twitch.tv/pixelretrostore (ejemplo)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
