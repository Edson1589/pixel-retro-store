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
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;

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

    private function resolveOrCreateCustomerFromAppointment(Appointment $a): ?int
    {
        $email = $a->customer->email ?? null;
        $name  = $a->customer->name  ?? 'Cliente';
        $phone = $a->contact_phone ?: null;
        $addr  = $a->address ?: null;

        if (!$email) {
            $existing = $phone ? Customer::where('phone', $phone)->first() : null;
            if ($existing) {
                $dirty = false;
                if (!$existing->name && $name) {
                    $existing->name  = $name;
                    $dirty = true;
                }
                if (!$existing->address && $addr) {
                    $existing->address = $addr;
                    $dirty = true;
                }
                if ($dirty) $existing->save();
                return $existing->id;
            }
            $c = Customer::create([
                'name'    => $name ?: 'Invitado',
                'email'   => null,
                'phone'   => $phone,
                'address' => $addr,
            ]);
            return $c->id;
        }

        $c = Customer::firstOrNew(['email' => $email]);
        if (!$c->exists) {
            $c->name    = $name ?: 'Invitado';
            $c->phone   = $phone;
            $c->address = $addr;
            $c->save();
        } else {
            $dirty = false;
            if (!$c->name && $name) {
                $c->name = $name;
                $dirty = true;
            }
            if (!$c->phone && $phone) {
                $c->phone = $phone;
                $dirty = true;
            }
            if (!$c->address && $addr) {
                $c->address = $addr;
                $dirty = true;
            }
            if ($dirty) $c->save();
        }

        return $c->id;
    }

    private function getOrCreateServiceProduct(): Product
    {
        $p = Product::where('is_service', true)->first();
        if ($p) return $p;

        return Product::create([
            'name'       => 'Servicios',
            'slug'       => 'servicios',
            'sku'        => 'SERV-001',
            'price'      => 0,
            'stock'      => 0,
            'condition'  => 'new',
            'is_unique'  => false,
            'image_url'  => null,
            'status'     => 'active',
            'is_service' => true,
        ]);
    }

    public function complete(Request $request, Appointment $appointment)
    {
        if (!in_array($appointment->status, ['confirmed', 'pending'], true)) {
            return response()->json(['message' => 'La cita no puede cerrarse en su estado actual.'], 422);
        }
        if ($appointment->sale_id) {
            return response()->json(['message' => 'La cita ya fue cerrada con una venta.'], 409);
        }

        $data = $request->validate([
            'service_amount'       => ['required', 'numeric', 'min:0'],
            'parts'                => ['sometimes', 'array'],
            'parts.*.product_id'   => ['required_with:parts', 'integer', 'exists:products,id'],
            'parts.*.quantity'     => ['required_with:parts', 'numeric', 'min:1'],
            'parts.*.unit_price'   => ['nullable', 'numeric', 'min:0'],
            'discount'             => ['nullable', 'numeric', 'min:0'],
            'payment_status'       => ['nullable', 'in:paid,pending'],
            'payment_ref'          => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $customerId = $this->resolveOrCreateCustomerFromAppointment($appointment);

        return DB::transaction(function () use ($appointment, $data, $user, $customerId) {

            $service = $this->getOrCreateServiceProduct();

            $sale = Sale::create([
                'user_id'     => $user->id,
                'customer_id' => $customerId,
                'status'      => $data['payment_status'] ?? 'paid',
                'payment_ref' => $data['payment_ref'] ?? null,
                'total'       => 0,
                'is_canceled' => false,
            ]);

            $details = [];
            $total   = 0;

            $serviceAmount = (float) $data['service_amount'];
            $details[] = new SaleDetail([
                'sale_id'    => $sale->id,
                'product_id' => $service->id,
                'quantity'   => 1,
                'unit_price' => $serviceAmount,
                'subtotal'   => $serviceAmount,
            ]);
            $total += $serviceAmount;

            $partsTotal = 0;
            foreach (($data['parts'] ?? []) as $p) {
                $prod  = Product::lockForUpdate()->find($p['product_id']);
                $qty   = (float) $p['quantity'];
                $price = isset($p['unit_price']) ? (float) $p['unit_price'] : (float) $prod->price;
                $sub   = $price * $qty;

                $details[] = new SaleDetail([
                    'sale_id'    => $sale->id,
                    'product_id' => $prod->id,
                    'quantity'   => $qty,
                    'unit_price' => $price,
                    'subtotal'   => $sub,
                ]);

                if (!$prod->is_service) {
                    if ($prod->stock < $qty) {
                        abort(409, 'Stock insuficiente para ' . $prod->name);
                    }
                    $prod->decrement('stock', (int) $qty);
                }

                $partsTotal += $sub;
                $total      += $sub;
            }

            $discount = (float) ($data['discount'] ?? 0);
            if ($discount > 0) $total = max(0, $total - $discount);

            $sale->details()->saveMany($details);
            $sale->update(['total' => $total]);

            $appointment->update([
                'status'         => 'completed',
                'sale_id'        => $sale->id,
                'service_amount' => $serviceAmount,
                'parts_total'    => $partsTotal,
                'discount'       => $discount,
                'grand_total'    => $total,
                'completed_at'   => now(),
                'completed_by'   => $user->id,
            ]);

            if ($appointment->customer && $appointment->customer->email) {
                Mail::to($appointment->customer->email)
                    ->send(new \App\Mail\AppointmentStatusChanged(
                        $appointment->fresh(),
                        'Servicio completado',
                        'Tu cita ha sido marcada como completada. ¡Gracias!'
                    ));
            }

            return response()->json([
                'message' => 'Cita cerrada y venta creada.',
                'data'    => $appointment->fresh()->load(['sale.details.product'])
            ]);
        });
    }
}
