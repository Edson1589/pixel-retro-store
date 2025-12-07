<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $req)
    {
        $per = min(max((int)$req->query('per_page', 15), 1), 100);

        $q = Sale::query()
            ->where('user_id', $req->user()->id)
            ->with(['details.product'])
            ->orderByDesc('id');

        return response()->json($q->paginate($per));
    }

    public function show(Request $req, int $id)
    {
        $sale = Sale::where('id', $id)
            ->where('user_id', $req->user()->id)
            ->with(['details.product'])
            ->firstOrFail();

        return response()->json($sale);
    }
}
