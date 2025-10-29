<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaleResource;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosSaleController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer.name'    => ['required', 'string', 'max:150'],
            'customer.ci'      => ['required', 'string', 'max:30'],
            'customer.email'   => ['required', 'email', 'max:255'],
            'customer.phone'   => ['nullable', 'string', 'max:40'],
            'customer.address' => ['nullable', 'string', 'max:255'],

            'items'                   => ['required', 'array', 'min:1'],
            'items.*.product_id'      => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'        => ['required', 'integer', 'min:1'],
        ]);

        $userId = $request->user()?->id;

        $sale = DB::transaction(function () use ($data, $userId) {

            $c = Customer::create([
                'name'    => $data['customer']['name'],
                'email'   => $data['customer']['email'],
                'ci'      => $data['customer']['ci']      ?? null,
                'phone'   => $data['customer']['phone']   ?? null,
                'address' => $data['customer']['address'] ?? null,
            ]);



            $total = 0;
            $lines = [];

            foreach ($data['items'] as $line) {
                $p = Product::lockForUpdate()->find($line['product_id']);
                if (!$p || $p->status !== 'active') {
                    abort(422, "Producto inválido o inactivo.");
                }

                $qty = (int)$line['quantity'];

                if ($p->stock < $qty) {
                    abort(422, "Sin stock suficiente para {$p->name}.");
                }

                if ($p->is_unique && $qty > 1) {
                    abort(422, "Artículo único: máximo 1 unidad ({$p->name}).");
                }

                $lineSubtotal = $qty * (float)$p->price;
                $total += $lineSubtotal;

                $lines[] = [
                    'product'  => $p,
                    'qty'      => $qty,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $paymentRef = 'POS-' . Str::upper(Str::random(8));
            $sale = Sale::create([
                'user_id'     => $userId,
                'customer_id' => $c->id,
                'total'       => $total,
                'status'      => 'paid',
                'payment_ref' => $paymentRef,
                'delivery_status' => 'to_deliver',
            ]);

            foreach ($lines as $ln) {
                $prod = $ln['product'];
                $qty  = $ln['qty'];

                SaleDetail::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $prod->id,
                    'quantity'   => $qty,
                    'unit_price' => $prod->price,
                    'subtotal'   => $ln['subtotal'],
                ]);

                $prod->decrement('stock', $qty);
            }

            return $sale;
        });

        $sale->load([
            'customer',
            'user:id,name',
            'details.product:id,name,sku,image_url',
        ])->loadSum('details', 'quantity');

        return (new SaleResource($sale))
            ->response()
            ->setStatusCode(201);
    }
}
