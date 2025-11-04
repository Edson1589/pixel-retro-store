<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Services\EventRegistrationStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EventRegistrationStatusCustomer;
use App\Support\TicketCode;
use App\Http\Requests\Admin\StoreEventRegistrationRequest;
use App\Http\Requests\Admin\UpdateEventRegistrationRequest;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventRegistrationController extends Controller
{
    public function index(int $eventId, Request $request)
    {
        $per = max(1, min(100, (int) $request->integer('per_page', 20)));

        $event = Event::findOrFail($eventId);
        $q = $event->registrations()->orderByDesc('id');

        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        if ($search = $request->string('q')->toString()) {
            $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('gamer_tag', 'like', "%$search%");
            });
        }

        return response()->json($q->paginate($per));
    }

    public function updateStatus(int $eventId, int $registrationId, Request $request)
    {
        $request->validate(['status' => ['required', 'in:pending,confirmed,cancelled']]);

        $reg = EventRegistration::where('event_id', $eventId)->findOrFail($registrationId);

        $to = $request->input('status');

        if ($to === 'confirmed' && !$reg->ticket_code) {
            $reg->ticket_code = TicketCode::generateUnique();
            $reg->ticket_issued_at = now();
        }

        $reg->status = $to;
        $reg->save();

        Mail::to($reg->email)->send(new EventRegistrationStatusCustomer($reg));

        return response()->json($reg);
    }

    public function store(int $eventId, StoreEventRegistrationRequest $request)
    {
        $event = Event::findOrFail($eventId);
        $data  = $request->validated();

        $force      = (bool)($data['force'] ?? false);
        $sendEmail  = (bool)($data['send_email'] ?? false);
        $checkInNow = (bool)($data['check_in'] ?? false);

        if (!$force && !is_null($event->remaining_capacity) && $event->remaining_capacity <= 0) {
            return response()->json(['message' => 'Capacidad agotada para este evento.'], 422);
        }

        $email  = mb_strtolower(trim($data['email']));
        $status = $data['status'] ?? 'pending';

        $participantUserId = $data['user_id'] ?? null;

        $payload = [
            'event_id'            => $event->id,
            'user_id'             => $participantUserId,
            'name'                => $data['name'],
            'email'               => $email,
            'gamer_tag'           => $data['gamer_tag'] ?? null,
            'team'                => $data['team'] ?? null,
            'notes'               => $data['notes'] ?? null,
            'status'              => $status,
            'source'              => 'admin',
            'created_by_admin_id' => auth()->id(),
        ];

        if ($status === 'confirmed') {
            $payload['ticket_code']      = TicketCode::generateUnique();
            $payload['ticket_issued_at'] = now();
        }

        $reg = null;
        for ($attempt = 0; $attempt < 5; $attempt++) {
            try {
                DB::beginTransaction();

                $reg = EventRegistration::create($payload);

                if ($checkInNow) {
                    $reg->checked_in_at = now();
                    $reg->checked_in_by = auth()->id();
                    $reg->save();
                }

                DB::commit();
                break;
            } catch (QueryException $e) {
                DB::rollBack();
                $msg = strtolower($e->getMessage());

                if (Str::contains($msg, 'event_registrations_event_id_email_unique')) {
                    $existing = EventRegistration::where('event_id', $event->id)
                        ->where('email', $email)
                        ->first();

                    return response()->json([
                        'message'  => 'Este email ya tiene un registro para el evento.',
                        'existing' => $existing,
                    ], 409);
                }

                if (Str::contains($msg, 'event_registrations_event_id_user_id_unique')) {
                    $existing = null;
                    if ($participantUserId) {
                        $existing = EventRegistration::where('event_id', $event->id)
                            ->where('user_id', $participantUserId)
                            ->first();
                    }

                    return response()->json([
                        'message'  => 'Este usuario ya tiene un registro para el evento.',
                        'existing' => $existing,
                    ], 409);
                }

                if (Str::contains($msg, 'event_registrations_ticket_code_unique')) {
                    $payload['ticket_code']      = TicketCode::generateUnique();
                    $payload['ticket_issued_at'] = now();
                    continue;
                }

                throw $e;
            }
        }

        if (!$reg) {
            return response()->json(['message' => 'No se pudo generar un ticket único. Intenta de nuevo.'], 409);
        }

        if ($sendEmail && $reg->status === 'confirmed') {
            try {
                Mail::to($reg->email)->send(new EventRegistrationStatusCustomer($reg));
            } catch (\Throwable $th) {
            }
        }

        return response()->json($reg->load('event'), 201);
    }

    public function update(int $eventId, int $registrationId, UpdateEventRegistrationRequest $request)
    {
        $reg = EventRegistration::where('event_id', $eventId)->findOrFail($registrationId);
        $data = $request->validated();

        if (($data['status'] ?? null) === 'confirmed' && !$reg->ticket_code) {
            $reg->ticket_code = TicketCode::generateUnique();
            $reg->ticket_issued_at = now();
        }

        $reg->fill($data)->save();

        return response()->json($reg);
    }

    public function checkin(int $eventId, int $registrationId, Request $request)
    {
        $reg = EventRegistration::where('event_id', $eventId)->findOrFail($registrationId);

        if ($reg->status === 'cancelled') {
            return response()->json(['message' => 'No se puede hacer check-in de un registro cancelado.'], 422);
        }

        $reg->checked_in_at = now();
        $reg->checked_in_by = auth()->id();
        $reg->save();

        return response()->json($reg);
    }
}
