<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    private function currentCart(int $userId): Cart
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }

    public function get(Request $req)
    {
        $cart = $this->currentCart($req->user()->id)->load('items.product');
        return response()->json([
            'items' => $cart->items->map(fn($it) => [
                'product_id' => $it->product_id,
                'quantity'   => $it->quantity,
                'unit_price' => (float)$it->unit_price,
                'product'    => $it->product,
            ]),
        ]);
    }

    //Hola
    //Pullrequest
    //PullRequest 2
    public function put(Request $req)
    {
        $data = $req->validate([
            'items' => ['array'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($req, $data) {
            $cart = $this->currentCart($req->user()->id);

            $snapshot = [];
            foreach ($data['items'] ?? [] as $row) {
                $p = Product::find($row['product_id']);
                if (!$p || $p->status !== 'active') abort(422, 'Producto inválido o inactivo.');
                $snapshot[] = [
                    'product_id' => $p->id,
                    'quantity'   => (int)$row['quantity'],
                    'unit_price' => (float)$p->price,
                ];
            }

            $cart->items()->delete();
            foreach ($snapshot as $s) {
                CartItem::create(['cart_id' => $cart->id] + $s);
            }

            return response()->json(['message' => 'Carrito actualizado']);
        });
    }

    public function addItem(Request $req)
    {
        $data = $req->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($req, $data) {
            $cart = $this->currentCart($req->user()->id);
            $p = Product::findOrFail($data['product_id']);
            if ($p->status !== 'active') abort(422, 'Producto inactivo');

            $item = $cart->items()->where('product_id', $p->id)->first();
            if ($item) {
                $item->update([
                    'quantity'   => $item->quantity + (int)$data['quantity'],
                    'unit_price' => (float)$p->price,
                ]);
            } else {
                CartItem::create([
                    'cart_id'    => $cart->id,
                    'product_id' => $p->id,
                    'quantity'   => (int)$data['quantity'],
                    'unit_price' => (float)$p->price,
                ]);
            }
            return response()->json(['message' => 'OK']);
        });
    }

    public function updateItem(Request $req, int $productId)
    {
        $data = $req->validate(['quantity' => ['required', 'integer', 'min:1']]);
        $cart = $this->currentCart($req->user()->id);
        $item = $cart->items()->where('product_id', $productId)->firstOrFail();
        $item->update(['quantity' => (int)$data['quantity']]);
        return response()->json(['message' => 'OK']);
    }

    public function removeItem(Request $req, int $productId)
    {
        $cart = $this->currentCart($req->user()->id);
        $cart->items()->where('product_id', $productId)->delete();
        return response()->json(['message' => 'OK']);
    }

    public function clear(Request $req)
    {
        $cart = $this->currentCart($req->user()->id);
        $cart->items()->delete();
        return response()->json(['message' => 'OK']);
    }
}
