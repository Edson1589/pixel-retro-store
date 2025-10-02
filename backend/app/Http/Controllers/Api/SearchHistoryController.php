<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SearchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SearchHistoryController extends Controller
{
    /**
     * Devuelve las últimas búsquedas del usuario o sesión.
     */
    public function index(Request $request)
    {
        $term = strtolower(trim($request->string('term')->toString()));

        // Identificador (user_id o session_id)
        $userId = auth()->check() ? auth()->id() : null;
        $sessionId = $request->cookie('session_id');

        // Si no hay cookie de sesión, generarla
        if (!$sessionId && !$userId) {
            $sessionId = (string) Str::uuid();
            cookie()->queue(cookie('session_id', $sessionId, 60 * 24 * 30, '/', null, false, true)); // 30 días
        }

        $query = SearchHistory::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        }

        if ($term) {
            $query->where('term', 'like', "%$term%");
        }

        $data = $query->latest()
            ->pluck('term')
            ->unique()
            ->take(10)
            ->toArray();

        return response()->json($data);
    }

    /**
     * Guarda un término de búsqueda en el historial.
     */
    public function store(Request $request)
    {
        $term = strtolower(trim($request->input('term')));
        if (!$term) {
            return response()->json(['message' => 'Término vacío'], 400);
        }

        $userId = auth()->check() ? auth()->id() : null;
        $sessionId = $request->cookie('session_id');

        // Generar cookie de sesión si no existe
        if (!$sessionId && !$userId) {
            $sessionId = (string) Str::uuid();
            cookie()->queue(cookie('session_id', $sessionId, 60 * 24 * 30, '/', null, false, true));
        }

        // Evitar duplicados exactos: actualizar si ya existe
        $existing = SearchHistory::where(function ($q) use ($userId, $sessionId) {
                if ($userId) {
                    $q->where('user_id', $userId);
                } else {
                    $q->where('session_id', $sessionId);
                }
            })
            ->where('term', $term)
            ->first();

        if ($existing) {
            $existing->touch(); // solo actualiza updated_at
        } else {
            SearchHistory::create([
                'user_id'    => $userId,
                'session_id' => $sessionId,
                'term'       => $term,
            ]);
        }

        return response()->json(['message' => 'Historial guardado']);
    }
}
