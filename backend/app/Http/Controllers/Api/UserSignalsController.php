<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserSignals;
use Illuminate\Http\Request;

class UserSignalsController extends Controller
{
    public function interact(Request $req, UserSignals $signals)
    {
        $data = $req->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'kind' => ['required', 'in:view,add,purchase'],
            'qty' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $qty = (int)($data['qty'] ?? 1);

        $signals->record((int)$req->user()->id, (int)$data['product_id'], $data['kind'], $qty);

        return response()->noContent();
    }
}
