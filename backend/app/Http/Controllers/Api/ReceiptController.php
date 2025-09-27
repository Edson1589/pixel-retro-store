<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptController extends Controller
{
    public function download(Request $request, Sale $sale)
    {
        if ((int)($sale->user_id ?? 0) !== (int)$request->user()->id) {
            abort(403, 'No puedes descargar este recibo.');
        }

        $sale->loadMissing(['customer', 'details.product']);

        $pdf = Pdf::loadView('receipts.receipt', ['sale' => $sale]);

        return $pdf->download("recibo-{$sale->id}.pdf");
    }
}
