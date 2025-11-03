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
}
