<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $onlyNonEmpty = $request->boolean('onlyNonEmpty', true);

        $q = \App\Models\Category::query()
            ->select('id', 'name', 'slug')
            ->withCount('products')
            ->withCount(['products as products_count' => fn($qq) => $qq->where('status', 'active')]);

        if ($onlyNonEmpty) {
            $q->whereHas('products')
                ->whereHas('products', fn($qq) => $qq->where('status', 'active'));
        }

        return response()->json(
            $q->orderBy('name')->get()
        );
    }
}
