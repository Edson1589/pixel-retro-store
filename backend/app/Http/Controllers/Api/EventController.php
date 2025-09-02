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
    public function index(Request $request)
    {
        $q = Event::query()->where('status', 'published');

        if ($type = $request->string('type')->toString()) {
            $q->where('type', $type); // event | tournament
        }
        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('title', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%")
                    ->orWhere('location', 'like', "%$search%");
            });
        }
        // upcoming por defecto
        $upcoming = $request->boolean('upcoming', true);
        if ($upcoming) {
            $q->where('start_at', '>=', Carbon::now());
        }

        $per = min(max((int)$request->query('per_page', 12), 1), 100);
        return response()->json($q->orderBy('start_at')->paginate($per));
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

        // capacidad
        if ($event->capacity) {
            $count = $event->registrations()->where('status', '!=', 'cancelled')->count();
            if ($count >= $event->capacity) abort(422, 'Cupo completo.');
        }

        // evita duplicado (único por email)
        $exists = $event->registrations()->where('email', $request->input('email'))->exists();
        if ($exists) abort(422, 'Este email ya está registrado para este evento.');

        $reg = $event->registrations()->create($request->validated()); // status = pending por defecto
        return response()->json([
            'message' => 'Registro recibido. Te contactaremos para confirmar.',
            'registration_id' => $reg->id,
        ], 201);
    }
}
