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

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'customer.name' => ['required', 'string', 'max:150'],
            'customer.email' => ['required', 'email', 'max:255'],
            'customer.phone' => ['nullable', 'string', 'max:40'],
            'customer.address' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($data) {
            $customer = Customer::updateOrCreate(
                ['email' => $data['customer']['email']],
                [
                    'name' => $data['customer']['name'],
                    'phone' => $data['customer']['phone'] ?? null,
                    'address' => $data['customer']['address'] ?? null,
                ]
            );

            $total = 0;
            $lines = [];
            foreach ($data['items'] as $line) {
                $p = Product::lockForUpdate()->find($line['product_id']);
                if (!$p || $p->status !== 'active') abort(422, 'Producto inválido o inactivo.');
                if ($p->stock < $line['quantity']) abort(422, "Sin stock para {$p->name}.");
                if ($p->is_unique && $line['quantity'] > 1) abort(422, "Artículo único: máx 1 unidad.");

                $qty = (int)$line['quantity'];
                $subtotal = $qty * (float)$p->price;
                $total += $subtotal;
                $lines[] = compact('p', 'qty', 'subtotal');
            }

            $sale = Sale::create([
                'customer_id' => $customer->id,
                'total' => $total,
                'status' => 'pending',
                'payment_ref' => null,
            ]);

            foreach ($lines as $l) {
                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_id' => $l['p']->id,
                    'quantity' => $l['qty'],
                    'unit_price' => $l['p']->price,
                    'subtotal' => $l['subtotal'],
                ]);
                $l['p']->decrement('stock', $l['qty']);
            }

            $ref = 'SIM-' . Str::upper(Str::random(10));
            $sale->update(['status' => 'paid', 'payment_ref' => $ref]);

            return response()->json([
                'message' => 'Pago simulado aprobado',
                'sale_id' => $sale->id,
                'payment_ref' => $ref,
                'total' => $total,
            ], 201);
        });
    }
}
