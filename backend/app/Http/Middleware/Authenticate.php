<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo($request): ?string
    {
        if (! $request->expectsJson()) {
            // Evita intentar ir a "login" (que no existe en API)
            abort(response()->json([
                'message' => 'No autenticado.'
            ], 401));
        }

        return null;
    }
}
