<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaleResource;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SaleController extends Controller
{
    public function index(Request $r)
    {
        $perPage = min(max((int)$r->integer('per_page', 20), 1), 100);

        $q = Sale::query()
            ->with(['customer:id,name,ci,email,phone,address', 'user:id,name'])
            ->withSum('details as items_qty', 'quantity');

        if ($status = $r->query('status')) {
            $q->where('status', $status);
        }

        if ($search = trim((string)$r->query('q', ''))) {
            $q->where(function ($w) use ($search) {
                $w->where('payment_ref', 'like', "%{$search}%")
                    ->orWhere('id', $search)
                    ->orWhereHas('customer', function ($c) use ($search) {
                        $c->where('name', 'like', "%{$search}%")
                            ->orWhere('ci', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($r->boolean('today', false)) {
            $q->whereBetween('created_at', [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()]);
        }

        if ($from = $r->query('from')) {
            $q->whereDate('created_at', '>=', $from);
        }
        if ($to = $r->query('to')) {
            $q->whereDate('created_at', '<=', $to);
        }

        $q->orderByDesc('created_at');

        return SaleResource::collection($q->paginate($perPage));
    }

    public function show(Sale $sale)
    {
        $sale->load([
            'customer',
            'user:id,name',
            'details.product:id,name,sku,image_url'
        ])->loadSum('details', 'quantity');

        return new SaleResource($sale);
    }

    public function updateStatus(Request $r, Sale $sale)
    {
        $data = $r->validate([
            'status' => ['required', Rule::in(['pending', 'paid', 'failed'])],
        ]);

        $sale->update(['status' => $data['status']]);

        $sale->load(['customer:id,name,email', 'user:id,name'])
            ->loadSum('details', 'quantity');

        return new SaleResource($sale);
    }

    public function summary(Request $r)
    {
        [$start, $end] = $this->rangeFromRequest($r, defaultToday: true);

        $base = Sale::query()->whereBetween('created_at', [$start, $end]);

        $countAll   = (clone $base)->count();
        $totalGross = (float) (clone $base)->sum('total');

        $vendidasCount = (clone $base)
            ->where('status', 'paid')
            ->where('is_canceled', false)
            ->count();

        $porEntregarCount = (clone $base)
            ->where('status', 'paid')
            ->where('is_canceled', false)
            ->where('delivery_status', 'to_deliver')
            ->count();

        $entregadoCount = (clone $base)
            ->where('status', 'paid')
            ->where('is_canceled', false)
            ->where('delivery_status', 'delivered')
            ->count();

        $anuladasCount = (clone $base)
            ->where('is_canceled', true)
            ->count();

        $paidCount    = (clone $base)->where('status', 'paid')->count();
        $pendingCount = (clone $base)->where('status', 'pending')->count();
        $failedCount  = (clone $base)->where('status', 'failed')->count();

        $paidTotal    = (float) (clone $base)->where('status', 'paid')->sum('total');
        $pendingTotal = (float) (clone $base)->where('status', 'pending')->sum('total');
        $failedTotal  = (float) (clone $base)->where('status', 'failed')->sum('total');

        $itemsSold = (int) SaleDetail::whereHas('sale', function ($s) use ($start, $end) {
            $s->whereBetween('created_at', [$start, $end])->where('status', 'paid');
        })->sum('quantity');

        $agg = SaleDetail::select(
            'product_id',
            DB::raw('SUM(quantity) as qty'),
            DB::raw('SUM(subtotal) as revenue')
        )
            ->whereHas('sale', fn($s) => $s->whereBetween('created_at', [$start, $end])->where('status', 'paid'))
            ->groupBy('product_id')
            ->get();

        $distinctProducts = $agg->count();
        $totalQtyProducts = (int) $agg->sum('qty');

        $limit = (int) $r->integer('limit', 10);
        $topAgg = $agg->sortByDesc('qty')->take($limit)->values();

        $productModels = Product::whereIn('id', $topAgg->pluck('product_id'))->get(['id', 'name', 'sku', 'image_url'])->keyBy('id');

        $top = $topAgg->map(function ($row) use ($productModels) {
            $p = $productModels->get($row->product_id);
            return [
                'product' => $p ? [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'image_url' => $p->image_url,
                ] : ['id' => $row->product_id],
                'qty' => (int) $row->qty,
                'revenue' => (float) $row->revenue,
            ];
        });

        return response()->json([
            'range' => [
                'from' => $start->toIso8601String(),
                'to'   => $end->toIso8601String(),
            ],
            'totals' => [
                'recaudado'     => $paidTotal,
                'ventas_total'  => $countAll,
                'ticket_prom'   => $countAll > 0 ? round($totalGross / $countAll, 2) : 0.0,
                'gross_total'   => $totalGross,
                'paid'          => ['count' => $paidCount,    'total' => $paidTotal],
                'pending'       => ['count' => $pendingCount, 'total' => $pendingTotal],
                'failed'        => ['count' => $failedCount,  'total' => $failedTotal],
                'items_sold'    => $itemsSold,
                'vendidas'      => $vendidasCount,
                'por_entregar'  => $porEntregarCount,
                'anuladas'      => $anuladasCount,
                'entregado'     => $entregadoCount,
            ],
            'products' => [
                'distinct' => $distinctProducts,
                'total_qty' => $totalQtyProducts,
                'top' => $top,
            ],
        ]);
    }

    public function export(Request $r)
    {
        [$start, $end] = $this->rangeFromRequest($r, defaultToday: false);
        $status = $r->query('status');
        $q = trim((string) $r->query('q', ''));
        $format = $r->query('format', 'csv');

        if ($format === 'pdf') {
            $query = \App\Models\Sale::query()
                ->whereBetween('created_at', [$start, $end])
                ->with(['customer:id,name,email'])
                ->withSum('details as items_qty', 'quantity')
                ->orderBy('id');

            if ($status) $query->where('status', $status);
            if ($q !== '') {
                $query->where(function ($w) use ($q) {
                    $w->where('payment_ref', 'like', "%{$q}%")
                        ->orWhere('id', $q)
                        ->orWhereHas('customer', function ($c) use ($q) {
                            $c->where('name', 'like', "%{$q}%")
                                ->orWhere('email', 'like', "%{$q}%");
                        });
                });
            }

            $rows = $query->get();

            $base = \App\Models\Sale::query()->whereBetween('created_at', [$start, $end]);
            $grossTotal = (float)(clone $base)->sum('total');
            $countAll   = (clone $base)->count();
            $paidTotal  = (float)(clone $base)->where('status', 'paid')->sum('total');
            $summary = [
                'recaudado'   => $paidTotal,
                'ventas_total' => $countAll,
                'ticket_prom' => $countAll ? round($grossTotal / $countAll, 2) : 0.0,
                'paid'        => ['count' => (clone $base)->where('status', 'paid')->count()],
                'pending'     => ['count' => (clone $base)->where('status', 'pending')->count()],
                'failed'      => ['count' => (clone $base)->where('status', 'failed')->count()],
            ];

            $agg = \App\Models\SaleDetail::select(DB::raw('SUM(quantity) as qty'))
                ->whereHas('sale', fn($s) => $s->whereBetween('created_at', [$start, $end])->where('status', 'paid'))
                ->first();
            $products = [
                'distinct'  => \App\Models\SaleDetail::whereHas('sale', fn($s) => $s->whereBetween('created_at', [$start, $end])->where('status', 'paid'))
                    ->distinct('product_id')->count('product_id'),
                'total_qty' => (int)($agg->qty ?? 0),
            ];

            $logo = null;
            $path = public_path('logo.png');
            if (is_file($path)) {
                $logo = 'data:image/png;base64,' . base64_encode(file_get_contents($path));
            }

            $pdf = Pdf::loadView('exports.sales_report', [
                'rows' => $rows,
                'from' => $start->toDateString(),
                'to'   => $end->toDateString(),
                'summary'  => $summary,
                'products' => $products,
                'logo'     => $logo,
            ])->setPaper('a4', 'portrait');

            $filename = sprintf('sales_%s_to_%s.pdf', $start->toDateString(), $end->toDateString());
            return $pdf->download($filename);
        }

        return $this->exportCsv($start, $end, $status, $q);
    }



    private function rangeFromRequest(Request $r, bool $defaultToday = true): array
    {
        $tz = config('app.timezone') ?? 'UTC';

        if ($r->filled('from') || $r->filled('to')) {
            $start = $r->filled('from')
                ? Carbon::parse($r->query('from'), $tz)->startOfDay()
                : Carbon::minValue();
            $end = $r->filled('to')
                ? Carbon::parse($r->query('to'), $tz)->endOfDay()
                : Carbon::maxValue();
            return [$start, $end];
        }

        if ($defaultToday) {
            return [Carbon::today($tz)->startOfDay(), Carbon::today($tz)->endOfDay()];
        }

        return [Carbon::minValue(), Carbon::maxValue()];
    }

    public function receipt(\App\Models\Sale $sale)
    {
        $sale->loadMissing([
            'customer',
            'user:id,name',
            'details.product'
        ]);

        $showUser = false;
        if ($sale->payment_ref && Str::startsWith($sale->payment_ref, 'POS-')) {
            $showUser = $sale->user && $sale->user->name;
        }

        $pdf = Pdf::loadView('receipts.receipt', [
            'sale'      => $sale,
            'showUser'  => $showUser,
        ]);
        return $pdf->download("recibo-{$sale->id}.pdf");
    }

    public function markDelivered(Request $r, Sale $sale)
    {
        if ($sale->is_canceled) {
            return response()->json(['message' => 'Venta anulada; no se puede entregar.'], 409);
        }
        if ($sale->status !== 'paid') {
            return response()->json(['message' => 'Solo ventas pagadas pueden entregarse.'], 409);
        }
        if ($sale->delivery_status === 'delivered') {
            return response()->json(['message' => 'Ya se registró la entrega.'], 409);
        }

        $data = $r->validate([
            'ci'    => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $sale->loadMissing('customer');

        if (!$sale->customer || !$sale->customer->ci) {
            return response()->json([
                'message' => 'La venta no tiene CI registrado del cliente; no se puede validar la entrega.',
            ], 422);
        }

        $ciIngresado = trim($data['ci']);
        $ciCliente   = trim($sale->customer->ci);

        if (strcasecmp($ciIngresado, $ciCliente) !== 0) {
            return response()->json([
                'message' => 'El CI ingresado no coincide con el del cliente.',
            ], 422);
        }

        $sale->update([
            'delivery_status'   => 'delivered',
            'delivered_at'      => now(),
            'delivered_by'      => $r->user()?->id,
            'delivered_to_ci'   => $ciIngresado,
            'delivered_to_name' => $sale->customer->name,
            'delivery_notes'    => $data['notes'] ?? null,
        ]);

        $sale->load([
            'customer:id,name,ci,email,phone,address',
            'user:id,name',
            'deliveredBy:id,name',
        ])->loadSum('details', 'quantity');

        return new SaleResource($sale);
    }

    public function deliveryNote(\App\Models\Sale $sale)
    {
        if ($sale->is_canceled) {
            abort(409, 'Venta anulada.');
        }

        $sale->loadMissing(['customer', 'details.product', 'deliveredBy:id,name']);

        $pdf = Pdf::loadView('receipts.delivery_note', [
            'sale' => $sale,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("nota-entrega-{$sale->id}.pdf");
    }

    public function void(Request $r, Sale $sale)
    {
        $data = $r->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        if ($sale->is_canceled) {
            return response()->json(['message' => 'La venta ya está anulada.'], 409);
        }

        DB::transaction(function () use ($sale, $r, $data) {
            $sale->loadMissing('details');

            foreach ($sale->details as $d) {
                $p = Product::lockForUpdate()->find($d->product_id);
                if ($p) {
                    $p->increment('stock', (int)$d->quantity);
                }
            }

            $sale->update([
                'is_canceled'   => true,
                'canceled_at'   => now(),
                'canceled_by'   => $r->user()?->id,
                'cancel_reason' => $data['reason'] ?? null,
                'delivery_status' => 'to_deliver',
            ]);
        });

        $sale->load(['customer:id,name,email', 'user:id,name', 'canceledBy:id,name'])
            ->loadSum('details', 'quantity');

        return new SaleResource($sale);
    }

    public function pickupDoc(Sale $sale)
    {
        if (!$sale->pickup_doc_path || !Storage::exists($sale->pickup_doc_path)) {
            abort(404, 'Sin documento');
        }

        return response()->file(Storage::path($sale->pickup_doc_path));
    }
}
