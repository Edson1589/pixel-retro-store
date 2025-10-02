<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SearchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Listado de productos con búsqueda avanzada y priorización por historial del usuario o sesión.
     */
    public function index(Request $request)
    {
        // Cantidad por página con límite de seguridad
        $per = max(1, min(100, (int) $request->integer('per_page', 15)));

        $q = Product::query()
            ->with('category')
            ->where('status', 'active');

        // ---------------------------
        // 🔎 Búsqueda avanzada
        // ---------------------------
        $search = $request->string('search')->toString();
        if ($search) {
            $q->search($search);

            // Guardar historial de búsqueda (usuario logueado o anónimo con session_id)
            if (auth()->check()) {
                SearchHistory::create([
                    'user_id' => auth()->id(),
                    'term'    => strtolower($search),
                ]);
            } else {
                // Generar o recuperar session_id desde cookie
                $sessionId = $request->cookie('session_id') ?? Str::uuid()->toString();

                // Si no existía cookie, asignar una nueva
                if (!$request->hasCookie('session_id')) {
                    cookie()->queue(cookie('session_id', $sessionId, 60 * 24 * 30)); // 30 días
                }

                SearchHistory::create([
                    'session_id' => $sessionId,
                    'term'       => strtolower($search),
                ]);
            }
        }

        // ---------------------------
        // 📂 Filtrar por categoría
        // ---------------------------
        if ($cat = $request->string('category')->toString()) {
            $q->whereHas('category', fn($w) => $w->where('slug', $cat));
        }

        // ---------------------------
        // ⭐ Priorizar productos según historial (user o session)
        // ---------------------------
        if (auth()->check()) {
            $history = SearchHistory::select('term', DB::raw('COUNT(*) as total'))
                ->where('user_id', auth()->id())
                ->groupBy('term')
                ->orderByDesc('total')
                ->limit(10)
                ->pluck('total', 'term'); // ["control" => 5, "mario" => 3]
        } else {
            $sessionId = $request->cookie('session_id');
            $history = $sessionId
                ? SearchHistory::select('term', DB::raw('COUNT(*) as total'))
                    ->where('session_id', $sessionId)
                    ->groupBy('term')
                    ->orderByDesc('total')
                    ->limit(10)
                    ->pluck('total', 'term')
                : collect();
        }

        if ($history->isNotEmpty()) {
            $cases = '';
            $bindings = [];
            $priority = 1;

            // Construir CASE dinámico
            foreach ($history as $term => $count) {
                $cases .= "WHEN LOWER(name) LIKE ? THEN $priority ";
                $bindings[] = '%' . strtolower($term) . '%';
                $priority++;
            }

            $q->orderByRaw("CASE $cases ELSE 999 END", $bindings);
        }

        // ---------------------------
        // 📌 Orden general y paginación
        // ---------------------------
        return response()->json(
            $q->orderBy('name')->paginate($per)
        );
    }

    /**
     * Mostrar detalle de un producto por slug
     */
    public function show(string $slug)
    {
        $p = Product::with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($p);
    }
}
