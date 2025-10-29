<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cart;
use Illuminate\Support\Facades\Mail;
use App\Mail\SaleReceiptCustomer;
use App\Mail\SaleReceiptAdmin;

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'customer.name'    => ['required', 'string', 'max:150'],
            'customer.ci'      => ['required', 'string', 'max:30'],
            'customer.email'   => ['required', 'email', 'max:255'],
            'customer.phone'   => ['nullable', 'string', 'max:40'],
            'customer.address' => ['nullable', 'string', 'max:255'],
            'pickup_doc'       => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
        ]);

        [$sale, $payload] = DB::transaction(function () use ($data, $request) {

            $customer = Customer::create([
                'name'    => $data['customer']['name'],
                'email'   => $data['customer']['email'],
                'ci'      => $data['customer']['ci'] ?? null,
                'phone'   => $data['customer']['phone'] ?? null,
                'address' => $data['customer']['address'] ?? null,
            ]);


            $total = 0;
            $lines = [];

            foreach ($data['items'] as $line) {
                $p = Product::lockForUpdate()->find($line['product_id']);
                if (!$p || $p->status !== 'active') abort(422, 'Producto inválido o inactivo.');
                if ($p->stock < $line['quantity']) abort(422, "Sin stock para {$p->name}.");
                if ($p->is_unique && $line['quantity'] > 1) abort(422, "Artículo único: máx 1 unidad.");

                $qty      = (int)$line['quantity'];
                $subtotal = $qty * (float)$p->price;
                $total   += $subtotal;

                $lines[] = compact('p', 'qty', 'subtotal');
            }

            $sale = Sale::create([
                'user_id'     => auth()->id(),
                'customer_id' => $customer->id,
                'total'       => $total,
                'status'      => 'pending',
                'payment_ref' => null,
                'delivery_status' => 'to_deliver',
            ]);

            foreach ($lines as $l) {
                SaleDetail::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $l['p']->id,
                    'quantity'   => $l['qty'],
                    'unit_price' => $l['p']->price,
                    'subtotal'   => $l['subtotal'],
                ]);

                $l['p']->decrement('stock', $l['qty']);
            }

            if ($request->hasFile('pickup_doc')) {
                $path = $request->file('pickup_doc')->store('pickup_docs');
                $sale->update([
                    'pickup_doc_path' => $path,
                ]);
            }

            $ref = 'SIM-' . Str::upper(Str::random(10));
            $sale->update([
                'status'      => 'paid',
                'payment_ref' => $ref
            ]);

            if ($uid = auth()->id()) {
                $cart = Cart::where('user_id', $uid)->first();
                if ($cart) {
                    $cart->items()->delete();
                }
            }

            $payload = [
                'message'     => 'Pago simulado aprobado',
                'sale_id'     => $sale->id,
                'payment_ref' => $ref,
                'total'       => $total,
            ];

            return [$sale, $payload];
        });

        $sale->load(['customer', 'details.product']);

        if ($sale->customer && $sale->customer->email) {
            Mail::to($sale->customer->email)
                ->send(new SaleReceiptCustomer($sale));
        }

        Mail::to(config('mail.from.admin_address'))
            ->send(new SaleReceiptAdmin($sale));

        return response()->json($payload, 201);
    }
}
