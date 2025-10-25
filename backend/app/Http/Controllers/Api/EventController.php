<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\EventRegistrationRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Services\EventSearch;
use App\Services\EventTrending;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $per = min(max((int)$request->query('per_page', 20), 1), 100);
        $page = max(1, (int)$request->query('page', 1));
        $search = trim((string)$request->query('search', ''));
        $type = $request->string('type')->toString() ?: null;
        $upcoming = $request->boolean('upcoming', true);

        if ($search !== '') {
            $engine = app(\App\Services\EventSearch::class);
            $paginator = $engine->search($search, $type, $upcoming, $page, $per);

            return response()->json([
                'data' => $paginator->items(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]);
        }

        $engine = app(EventTrending::class);
        $paginator = $engine->list($type, $upcoming, $page, $per);

        return response()->json([
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }


    public function show(string $slug)
    {
        $e = Event::where('slug', $slug)->where('status', 'published')->firstOrFail();
        return response()->json($e);
    }

    public function register(EventRegistrationRequest $request, string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        if ($event->status !== 'published') abort(422, 'Registro no disponible.');

        $now = Carbon::now();
        if ($event->registration_open_at && $now->lt($event->registration_open_at)) {
            abort(422, 'Aún no se abrió el registro.');
        }
        if ($event->registration_close_at && $now->gt($event->registration_close_at)) {
            abort(422, 'El registro ya cerró.');
        }

        if ($event->capacity) {
            $count = $event->registrations()->where('status', '!=', 'cancelled')->count();
            if ($count >= $event->capacity) abort(422, 'Cupo completo.');
        }

        $exists = $event->registrations()->where('email', $request->input('email'))->exists();
        if ($exists) abort(422, 'Este email ya está registrado para este evento.');

        $reg = $event->registrations()->create($request->validated());
        return response()->json([
            'message' => 'Registro recibido. Te contactaremos para confirmar.',
            'registration_id' => $reg->id,
        ], 201);
    }
}
