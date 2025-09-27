<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;

class EventRegistrationController extends Controller
{
    public function index(int $eventId, Request $request)
    {
        $event = Event::findOrFail($eventId);
        $q = $event->registrations()->orderByDesc('id');
        if ($status = $request->string('status')->toString()) {
            $q->where('status', $status);
        }
        return response()->json($q->paginate(30));
    }

    public function updateStatus(int $eventId, int $registrationId, Request $request)
    {
        $request->validate(['status' => ['required', 'in:pending,confirmed,cancelled']]);
        $reg = EventRegistration::where('event_id', $eventId)->findOrFail($registrationId);
        $reg->update(['status' => $request->input('status')]);
        return response()->json($reg);
    }
}
