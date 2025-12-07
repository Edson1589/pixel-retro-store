<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next)
    {
        $u = $request->user();

        if (!$u || !$u->must_change_password) {
            return $next($request);
        }

        $routeName = (string) ($request->route()?->getName() ?? '');
        $allowedByName = [

            'admin.me',
            'admin.password.change',
            'admin.logout',

            'customer.me',
            'customer.password.change',
            'customer.logout',
        ];
        if (in_array($routeName, $allowedByName, true)) {
            return $next($request);
        }

        if ($request->is(

            'api/admin/password/change',
            'api/admin/logout',

            'api/auth/password/change',
            'api/auth/logout'
        )) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Debes cambiar tu contraseña para continuar.',
            'must_change_password' => true,
        ], 428);
    }
}
