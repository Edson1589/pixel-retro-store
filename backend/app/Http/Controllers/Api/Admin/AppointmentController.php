<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointments\AcceptAppointmentRequest;
use App\Http\Requests\Appointments\RejectAppointmentRequest;
use App\Http\Requests\Appointments\RescheduleAppointmentRequest;
use App\Mail\AppointmentStatusChanged;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $u = $request->user();

        $q = Appointment::with(['customer', 'technician'])->latest('created_at');

        if ($u->isTechnician()) {
            $q->where(function ($sub) use ($u) {
                $sub->whereNull('technician_id')
                    ->orWhere('technician_id', $u->id);
            });
        }

        if ($status = $request->query('status')) $q->where('status', $status);
        if ($from = $request->query('from')) $q->whereDate('preferred_at', '>=', $from);
        if ($to = $request->query('to'))     $q->whereDate('preferred_at', '<=', $to);

        return $q->paginate(max(5, min(100, (int)$request->integer('per_page', 20))));
    }

    // Aceptar
    public function accept(AcceptAppointmentRequest $request, Appointment $appointment)
    {
        $u = $request->user();

        if (!in_array($appointment->status, ['pending', 'rescheduled'])) {
            return response()->json(['message' => 'La cita no está disponible para confirmar.'], 422);
        }

        $data = $request->validated();
        $scheduled = Carbon::parse($data['scheduled_at']);
        $minutes = (int)($data['duration_minutes'] ?? $appointment->duration_minutes ?? 60);

        if (Appointment::overlaps($u->id, $scheduled, $minutes)->exists()) {
            return response()->json(['message' => 'Conflicto de horarios con otra cita.'], 422);
        }

        $appointment->technician_id = $u->id;
        $appointment->scheduled_at = $scheduled;
        $appointment->duration_minutes = $minutes;
        $appointment->status = 'confirmed';
        $appointment->reschedule_proposed_at = null;
        $appointment->reschedule_note = null;
        $appointment->save();

        Mail::to($appointment->customer->email)
            ->send(new AppointmentStatusChanged(
                $appointment,
                'Cita confirmada',
                'Tu cita ha sido confirmada. Te esperamos en la fecha acordada.'
            ));

        return response()->json(['message' => 'Cita confirmada.', 'data' => $appointment->fresh()]);
    }

    public function reject(RejectAppointmentRequest $request, Appointment $appointment)
    {
        if (!in_array($appointment->status, ['pending', 'rescheduled'])) {
            return response()->json(['message' => 'La cita no está disponible para rechazo.'], 422);
        }

        $appointment->status = 'rejected';
        $appointment->reject_reason = $request->validated()['reason'];
        $appointment->save();

        Mail::to($appointment->customer->email)
            ->send(new AppointmentStatusChanged(
                $appointment,
                'Cita rechazada',
                'Lo sentimos, tu cita fue rechazada. Motivo: ' . $appointment->reject_reason
            ));

        return response()->json(['message' => 'Cita rechazada.', 'data' => $appointment->fresh()]);
    }

    public function reschedule(RescheduleAppointmentRequest $request, Appointment $appointment)
    {
        $u = $request->user();

        $data = $request->validated();
        $proposed = Carbon::parse($data['proposed_at']);
        $minutes = (int)($data['duration_minutes'] ?? $appointment->duration_minutes ?? 60);

        if (Appointment::overlaps($u->id, $proposed, $minutes)->exists()) {
            return response()->json(['message' => 'Conflicto de horarios con otra cita.'], 422);
        }

        $appointment->technician_id = $u->id;
        $appointment->status = 'rescheduled';
        $appointment->reschedule_proposed_at = $proposed;
        $appointment->reschedule_note = $data['note'] ?? null;
        $appointment->save();

        Mail::to($appointment->customer->email)
            ->send(new AppointmentStatusChanged(
                $appointment,
                'Propuesta de reprogramación',
                'Se propuso nueva fecha/hora. Por favor, acepta o rechaza desde tu cuenta.'
            ));

        return response()->json(['message' => 'Propuesta enviada.', 'data' => $appointment->fresh()]);
    }

    public function complete(Request $request, Appointment $appointment)
    {
        if ($appointment->status !== 'confirmed') {
            return response()->json(['message' => 'La cita debe estar confirmada para completarla.'], 422);
        }
        $appointment->status = 'completed';
        $appointment->save();

        Mail::to($appointment->customer->email)
            ->send(new AppointmentStatusChanged(
                $appointment,
                'Servicio completado',
                'Tu cita ha sido marcada como completada. ¡Gracias!'
            ));

        return response()->json(['message' => 'Cita completada.', 'data' => $appointment->fresh()]);
    }
}
