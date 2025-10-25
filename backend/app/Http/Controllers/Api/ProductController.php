<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\ProductSearch;
use App\Services\ProductTrending;
use App\Services\ProductPersonalized;

class ProductController extends Controller
{

    public function index(Request $request)
    {
        $per = max(1, min(100, (int) $request->integer('per_page', 20)));
        $page = max(1, (int) $request->integer('page', 1));
        $search = trim((string)$request->query('search', ''));
        $category = (string)$request->query('category', '');
        $sort = (string)$request->query('sort', 'trending');

        $rawCond  = strtolower((string) $request->query('condition', ''));
        $condition = match ($rawCond) {
            'nuevo' => 'new',
            'usado' => 'used',
            'reacondicionado' => 'refurbished',
            'new', 'used', 'refurbished' => $rawCond,
            default => '',
        };

        $cond = $condition !== '' ? $condition : null;

        if ($search !== '') {
            $engine = app(ProductSearch::class);
            $paginator = $engine->search($search, $category ?: null, $page, $per, $cond);

            return response()->json([
                'data' => $paginator->items(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]);
        }

        if (auth('sanctum')->check()) {
            $engine = app(ProductPersonalized::class);
            $paginator = $engine->listForUser(auth('sanctum')->id(), $category ?: null, $page, $per, $cond);
        } else {
            $engine = app(ProductTrending::class);
            $paginator = $engine->list($category ?: null, $page, $per, $cond);
        }

        return response()->json([
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ]);
    }


    public function show(string $slug)
    {
        $p = Product::with('category')->where('slug', $slug)->firstOrFail();
        return response()->json($p);
    }
}
