<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\ConfirmIntentRequest;
use App\Http\Requests\Payments\CreateIntentRequest;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentEvent;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cart;

class PaymentController extends Controller
{
    private function brandFrom(string $num): string
    {
        $n = preg_replace('/\s+/', '', $num);
        return preg_match('/^4/', $n) ? 'visa' : (preg_match('/^5[1-5]/', $n) ? 'mastercard' : 'card');
    }

    private function simulateCardFlow(string $card): array
    {
        $c = preg_replace('/\s+/', '', $card);
        return match ($c) {
            '4000000000000002' => ['failed', 'card_declined', false, null],
            '4000000000009995' => ['failed', 'insufficient_funds', false, null],
            '4000000000000069' => ['failed', 'expired_card', false, null],
            '4000000000003220' => ['requires_action', null, true, 'otp'],
            default            => ['succeeded', null, false, null],
        };
    }

    private function logEvent(Payment $p, string $type, array $data = []): void
    {
        if (class_exists(PaymentEvent::class)) {
            PaymentEvent::create(['payment_id' => $p->id, 'type' => $type, 'data' => $data]);
        }
    }

    public function createIntent(CreateIntentRequest $request)
    {
        $data = $request->validated();

        $amountCents = 0;
        foreach ($data['items'] as $it) {
            $p = Product::findOrFail((int)$it['product_id']);
            $amountCents += (int) round($p->price * 100) * (int) $it['qty'];
        }

        $intent = 'pi_' . Str::random(24);
        $secret = 'sec_' . Str::random(32);

        $payment = Payment::create([
            'provider'      => 'simulator',
            'intent_id'     => $intent,
            'client_secret' => $secret,
            'amount'        => $amountCents,
            'currency'      => $data['currency'] ?? 'BOB',
            'status'        => 'requires_confirmation',
            'metadata'      => [
                'customer' => $data['customer'],
                'items'    => $data['items'],
            ],
        ]);

        $this->logEvent($payment, 'intent.created');

        return response()->json([
            'id'            => $payment->intent_id,
            'client_secret' => $payment->client_secret,
            'amount'        => $payment->amount,
            'currency'      => $payment->currency,
            'status'        => $payment->status,
        ], 201);
    }

    public function confirmIntent(ConfirmIntentRequest $request, string $intentId)
    {
        $data = $request->validated();

        $payment = Payment::where('intent_id', $intentId)
            ->where('client_secret', $data['client_secret'])
            ->firstOrFail();

        if (in_array($payment->status, ['succeeded', 'failed', 'canceled']) && $payment->sale_id) {
            return response()->json([
                'message'     => 'Payment already finalized',
                'status'      => $payment->status,
                'payment_ref' => $payment->intent_id,
                'sale_id'     => $payment->sale_id,
            ], 409);
        }


        // Este cambio es para pruebas
        [$status, $reason, $needsAction, $nextAction] = $this->simulateCardFlow($data['card_number']);

        $payment->update([
            'brand' => $this->brandFrom($data['card_number']),
            'last4' => substr(preg_replace('/\s+/', '', $data['card_number']), -4),
        ]);

        if ($status === 'failed') {
            $payment->update(['status' => 'failed', 'failure_reason' => $reason]);
            $this->logEvent($payment, 'payment.failed', ['reason' => $reason]);
            return response()->json(['message' => 'Pago rechazado', 'reason' => $reason, 'status' => 'failed'], 402);
        }

        if ($needsAction) {
            $payment->update(['status' => 'requires_action', 'requires_action' => true, 'next_action' => $nextAction]);
            $this->logEvent($payment, 'payment.requires_action', ['action' => $nextAction]);
            return response()->json([
                'status'        => 'requires_action',
                'next_action'   => $nextAction,
                'id'            => $payment->intent_id,
                'client_secret' => $payment->client_secret,
            ], 202);
        }

        // Este es un prueba
        return $this->finalizeSale($payment);
    }

    public function verify3ds(Request $req, string $intentId)
    {
        $req->validate([
            'client_secret' => ['required', 'string'],
            'otp'           => ['required', 'string', 'size:6'],
        ]);

        $clientSecret = (string) $req->input('client_secret');
        $otp          = (string) $req->input('otp');

        $payment = Payment::where('intent_id', $intentId)
            ->where('client_secret', $clientSecret)
            ->firstOrFail();

        if ($payment->status !== 'requires_action') {
            return response()->json([
                'message' => 'No requiere verificación',
                'status'  => $payment->status
            ], 409);
        }

        if ($otp !== '123456') {
            $payment->update([
                'status'           => 'failed',
                'failure_reason'   => 'otp_invalid',
                'requires_action'  => false,
                'next_action'      => null,
            ]);
            $this->logEvent($payment, 'payment.failed', ['reason' => 'otp_invalid']);

            return response()->json([
                'message' => 'OTP inválido',
                'status'  => 'failed'
            ], 422);
        }

        return $this->finalizeSale($payment);
    }

    private function finalizeSale(Payment $payment)
    {
        try {
            return DB::transaction(function () use ($payment) {
                $meta  = $payment->metadata ?? [];
                $cust  = $meta['customer'] ?? null;
                $items = $meta['items'] ?? [];

                $customerId = null;
                if ($cust && isset($cust['email'])) {
                    $c = Customer::updateOrCreate(
                        ['email' => $cust['email']],
                        [
                            'name'    => $cust['name'] ?? 'Invitado',
                            'phone'   => $cust['phone'] ?? null,
                            'address' => $cust['address'] ?? null
                        ]
                    );
                    $customerId = $c->id;
                }

                $total   = 0;
                $details = [];
                foreach ($items as $it) {
                    $p   = Product::lockForUpdate()->findOrFail((int)$it['product_id']);
                    $qty = (int) $it['qty'];
                    if ($qty < 1) abort(422, 'Cantidad inválida');
                    if ($p->is_unique && $qty > 1) abort(409, 'Pieza única, solo 1 unidad');
                    if ($p->stock < $qty) abort(409, 'Stock insuficiente para ' . $p->name);

                    $total    += $p->price * $qty;
                    $details[] = [$p, $qty];
                }

                foreach ($details as [$p, $qty]) {
                    $p->decrement('stock', $qty);
                }

                $sale = Sale::create([
                    'user_id'     => auth()->id(),
                    'customer_id' => $customerId,
                    'total'       => $total,
                    'status'      => 'paid',
                    'payment_ref' => $payment->intent_id,
                ]);

                foreach ($details as [$p, $qty]) {
                    SaleDetail::create([
                        'sale_id'    => $sale->id,
                        'product_id' => $p->id,
                        'quantity'   => $qty,
                        'unit_price' => $p->price,
                        'subtotal'   => $p->price * $qty,
                    ]);
                }

                $payment->update([
                    'status'          => 'succeeded',
                    'requires_action' => false,
                    'next_action'     => null,
                    'sale_id'         => $sale->id,
                ]);

                $this->logEvent($payment, 'payment.succeeded', ['sale_id' => $sale->id]);

                if ($uid = auth()->id()) {
                    $cart = Cart::where('user_id', $uid)->first();
                    if ($cart) {
                        $cart->items()->delete();
                    }
                }

                return response()->json([
                    'status'      => 'succeeded',
                    'payment_ref' => $payment->intent_id,
                    'sale_id'     => $sale->id,
                    'total'       => $sale->total,
                    'receipt_url' => url("/api/account/orders/{$sale->id}/receipt"),
                ]);
            });
        } catch (\Throwable $e) {
            logger()->error('finalizeSale error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            $payment->update(['status' => 'failed', 'failure_reason' => 'stock_or_transaction']);
            $this->logEvent($payment, 'payment.failed', ['reason' => 'stock_or_transaction']);
            return response()->json(['message' => 'Error de stock o transacción', 'status' => 'failed'], 409);
        }
    }
}
