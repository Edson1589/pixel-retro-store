<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\EventRegistrationRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EventController extends Controller
{
    /**
     * Listado de eventos públicos con búsqueda avanzada.
     */
    public function index(Request $request)
    {
        $q = Event::query()->where('status', 'published');

        // 🔎 Filtro por tipo (event o tournament)
        if ($type = $request->string('type')->toString()) {
            $q->where('type', $type);
        }

        // 🔎 Búsqueda avanzada usando scopeSearch del modelo
        if ($search = $request->string('search')->toString()) {
            $q->search($search);
        }

        // 🔎 Solo eventos futuros por defecto
        $upcoming = $request->boolean('upcoming', true);
        if ($upcoming) {
            $q->where('start_at', '>=', Carbon::now());
        }

        // 🔎 Paginación con límite de seguridad
        $per = min(max((int)$request->query('per_page', 12), 1), 100);

        return response()->json(
            $q->orderBy('start_at')->paginate($per)
        );
    }

    /**
     * Mostrar detalle de un evento por slug.
     */
    public function show(string $slug)
    {
        $e = Event::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json($e);
    }

    /**
     * Registrar un usuario en un evento (validaciones de fechas y cupo).
     */
    public function register(EventRegistrationRequest $request, string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if ($event->status !== 'published') {
            abort(422, 'Registro no disponible.');
        }

        $now = Carbon::now();

        if ($event->registration_open_at && $now->lt($event->registration_open_at)) {
            abort(422, 'Aún no se abrió el registro.');
        }

        if ($event->registration_close_at && $now->gt($event->registration_close_at)) {
            abort(422, 'El registro ya cerró.');
        }

        if ($event->capacity) {
            $count = $event->registrations()
                ->where('status', '!=', 'cancelled')
                ->count();

            if ($count >= $event->capacity) {
                abort(422, 'Cupo completo.');
            }
        }

        $exists = $event->registrations()
            ->where('email', $request->input('email'))
            ->exists();

        if ($exists) {
            abort(422, 'Este email ya está registrado para este evento.');
        }

        $reg = $event->registrations()->create($request->validated());

        return response()->json([
            'message' => 'Registro recibido. Te contactaremos para confirmar.',
            'registration_id' => $reg->id,
        ], 201);
    }
}
