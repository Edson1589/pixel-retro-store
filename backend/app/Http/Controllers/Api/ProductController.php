<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $per = max(1, min(100, (int) $request->integer('per_page', 15)));

        $q = Product::query()->with('category')->where('status', 'active');

        if ($search = $request->string('search')->toString()) {
            $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%")
                    ->orWhere('sku', 'like', "%$search%");
            });
        }
        if ($cat = $request->string('category')->toString()) {
            $q->whereHas('category', fn($w) => $w->where('slug', $cat));
        }

        return response()->json($q->orderBy('name')->paginate($per));
    }

    public function show(string $slug)
    {
        $p = Product::with('category')->where('slug', $slug)->firstOrFail();
        return response()->json($p);
    }
}
