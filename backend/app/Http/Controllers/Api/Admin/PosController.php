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

class PosController extends Controller
{
    public function searchProducts(Request $r)
    {
        $term = trim((string)$r->query('q', ''));

        $products = Product::query()
            ->where('status', 'active')
            ->when($term !== '', function ($q) use ($term) {
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%");
                });
            })
            ->orderBy('name')
            ->limit(20)
            ->get([
                'id',
                'name',
                'sku',
                'price',
                'stock',
                'is_unique',
                'image_url',
            ]);

        return response()->json($products);
    }

    public function searchCustomers(Request $r)
    {
        $term = trim((string)$r->query('q', ''));
        if ($term === '') {
            return response()->json([]);
        }

        $customers = Customer::query()
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('ci', 'like', "%{$term}%");
            })
            ->orderBy('name')
            ->limit(20)
            ->get([
                'id',
                'name',
                'ci',
                'email',
                'phone',
                'address',
            ]);

        return response()->json($customers);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'customer_id'        => ['nullable', 'integer', 'exists:customers,id'],
            'customer'           => ['nullable', 'array'],
            'customer.name'      => ['required_without:customer_id', 'string', 'max:150'],
            'customer.ci'        => ['required_without:customer_id', 'string', 'max:30'],
            'customer.email'     => ['required_without:customer_id', 'email', 'max:255'],
            'customer.phone'     => ['nullable', 'string', 'max:40'],
            'customer.address'   => ['nullable', 'string', 'max:255'],

            'items'                      => ['required', 'array', 'min:1'],
            'items.*.product_id'         => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'           => ['required', 'integer', 'min:1'],
            'items.*.unit_price'         => ['nullable', 'numeric', 'min:0'],
        ]);

        return DB::transaction(function () use ($data, $r) {
            if (!empty($data['customer_id'])) {
                $customer = Customer::findOrFail($data['customer_id']);

                $customer->update([
                    'ci'      => $data['customer']['ci']      ?? $customer->ci,
                    'phone'   => $data['customer']['phone']   ?? $customer->phone,
                    'address' => $data['customer']['address'] ?? $customer->address,
                ]);
            } else {
                $customer = Customer::create([
                    'name'    => $data['customer']['name'],
                    'email'   => $data['customer']['email'],
                    'ci'      => $data['customer']['ci']      ?? null,
                    'phone'   => $data['customer']['phone']   ?? null,
                    'address' => $data['customer']['address'] ?? null,
                ]);
            }

            $total  = 0;
            $lines  = [];
            foreach ($data['items'] as $line) {
                $p = Product::lockForUpdate()->find($line['product_id']);

                if (!$p || $p->status !== 'active') {
                    abort(422, "Producto inválido o inactivo (#{$line['product_id']}).");
                }

                $qty = (int)$line['quantity'];
                if ($qty < 1) {
                    abort(422, "Cantidad inválida para {$p->name}.");
                }
                if ($p->is_unique && $qty > 1) {
                    abort(422, "Artículo único '{$p->name}': máx 1 unidad.");
                }
                if ($p->stock < $qty) {
                    abort(422, "Sin stock suficiente para {$p->name}.");
                }
                $unitPrice = array_key_exists('unit_price', $line)
                    ? (float)$line['unit_price']
                    : (float)$p->price;

                $subtotal = $qty * $unitPrice;
                $total   += $subtotal;

                $lines[] = [
                    'product'   => $p,
                    'qty'       => $qty,
                    'unitPrice' => $unitPrice,
                    'subtotal'  => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id'     => $r->user()->id,
                'customer_id' => $customer->id,
                'total'       => $total,
                'status'      => 'paid',
                'payment_ref' => 'POS-' . Str::upper(Str::random(8)),
                'delivery_status' => 'to_deliver',
            ]);

            foreach ($lines as $l) {
                SaleDetail::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $l['product']->id,
                    'quantity'   => $l['qty'],
                    'unit_price' => $l['unitPrice'],
                    'subtotal'   => $l['subtotal'],
                ]);

                $l['product']->decrement('stock', $l['qty']);
            }

            $sale->load([
                'customer',
                'user:id,name',
                'details.product:id,name,sku,image_url'
            ])->loadSum('details', 'quantity');

            return (new SaleResource($sale))
                ->response()
                ->setStatusCode(201);
        });
    }
}
