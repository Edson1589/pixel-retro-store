<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointments\StoreAppointmentRequest;
use App\Http\Requests\Appointments\ConfirmRescheduleRequest;
use App\Mail\AppointmentStatusChanged;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $u = $request->user();
        $q = Appointment::with(['technician'])
            ->where('customer_id', $u->id)
            ->latest('created_at');

        if ($s = $request->query('status')) $q->where('status', $s);

        return $q->paginate(max(5, min(100, (int)$request->integer('per_page', 20))));
    }

    public function store(StoreAppointmentRequest $request)
    {
        $u = $request->user();
        $data = $request->validated();
        $data['duration_minutes'] = $data['duration_minutes'] ?? 60;

        $preferred = Carbon::parse($data['preferred_at']);

        $hasAvailableTech = User::where('role', 'technician')->whereNotNull('id')->get()->contains(function (User $tech) use ($preferred, $data) {
            return !Appointment::overlaps($tech->id, $preferred, (int)$data['duration_minutes'])->exists();
        });

        $appt = Appointment::create([
            'customer_id'         => $u->id,
            'service_type'        => $data['service_type'],
            'console'             => $data['console'],
            'problem_description' => $data['problem_description'],
            'location'            => $data['location'],
            'address'             => $data['address'] ?? null,
            'contact_phone'       => $data['contact_phone'],
            'preferred_at'        => $preferred,
            'duration_minutes'    => (int)$data['duration_minutes'],
            'status'              => 'pending',
            'customer_notes'      => $data['customer_notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Solicitud enviada. Un técnico la revisará y te confirmará pronto.',
            'available' => $hasAvailableTech,
            'data' => $appt->fresh(),
        ], 201);
    }

    public function show(Request $request, Appointment $appointment)
    {
        $this->authorizeSelf($request, $appointment);
        return $appointment->load(['technician']);
    }

    public function confirmReschedule(ConfirmRescheduleRequest $request, Appointment $appointment)
    {
        $this->authorizeSelf($request, $appointment);
        if ($appointment->status !== 'rescheduled' || !$appointment->reschedule_proposed_at) {
            return response()->json(['message' => 'La cita no está en estado de reprogramación.'], 422);
        }

        if ($request->boolean('accept')) {
            $appointment->status = 'confirmed';
            $appointment->scheduled_at = $appointment->reschedule_proposed_at;
            $appointment->reschedule_note = null;
            $appointment->save();

            Mail::to($appointment->customer->email)
                ->send(new AppointmentStatusChanged($appointment, 'Cita confirmada', 'Tu cita reprogramada ha sido confirmada.'));
        } else {
            $appointment->status = 'pending';
            $appointment->reschedule_proposed_at = null;
            $appointment->reschedule_note = null;
            $appointment->save();

            Mail::to($appointment->customer->email)
                ->send(new AppointmentStatusChanged($appointment, 'Reprogramación rechazada', 'Tu respuesta fue registrada. Un técnico propondrá otra fecha.'));
        }

        return response()->json(['message' => 'Respuesta registrada.', 'data' => $appointment->fresh()]);
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        $this->authorizeSelf($request, $appointment);
        if (in_array($appointment->status, ['completed', 'rejected', 'cancelled'])) {
            return response()->json(['message' => 'La cita no puede cancelarse en su estado actual.'], 422);
        }
        $appointment->status = 'cancelled';
        $appointment->save();

        Mail::to($appointment->customer->email)
            ->send(new AppointmentStatusChanged($appointment, 'Cita cancelada', 'Tu cita ha sido cancelada.'));

        return response()->json(['message' => 'Cita cancelada.', 'data' => $appointment->fresh()]);
    }

    private function authorizeSelf(Request $request, Appointment $appointment): void
    {
        if ($appointment->customer_id !== $request->user()->id) {
            abort(403);
        }
    }
}
