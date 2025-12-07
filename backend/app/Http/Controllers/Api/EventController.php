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
use Illuminate\Support\Facades\Mail;
use App\Mail\EventRegistrationCustomer;
use App\Mail\EventRegistrationAdmin;

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

        $userId = $request->user()?->id;
        if ($userId) {
            $existsUser = $event->registrations()->where('user_id', $userId)->exists();
            if ($existsUser) abort(422, 'Ya te registraste a este evento.');
        }
        $existsEmail = $event->registrations()->where('email', $request->input('email'))->exists();
        if ($existsEmail) abort(422, 'Este email ya está registrado para este evento.');

        $payload = $request->validated();
        if ($userId) {
            $payload['user_id'] = $userId;
            $payload['name']  = $payload['name']  ?? $request->user()->name;
            $payload['email'] = $payload['email'] ?? $request->user()->email;
        }

        $reg = $event->registrations()->create($payload);

        Mail::to($reg->email)->send(new EventRegistrationCustomer($reg));

        $admin = config('mail.from.admin_address');
        if ($admin) {
            Mail::to($admin)->send(new EventRegistrationAdmin($reg));
        }

        return response()->json([
            'message' => 'Registro recibido. Te contactaremos para confirmar.',
            'registration_id' => $reg->id,
        ], 201);
    }

    public function myRegistration(Request $request, string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $email = $request->user()?->email ?? $request->query('email');
        if (!$email) abort(400, 'Falta email');

        $q = $event->registrations()->where('email', $email);
        if ($request->user()) {
            $q->orWhere('user_id', $request->user()->id);
        }

        $reg = $q->latest('id')->first();

        return response()->json([
            'registered'   => (bool) $reg,
            'status'       => $reg?->status,
            'registration' => $reg,
        ]);
    }
}
