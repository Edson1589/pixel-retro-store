<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class OptionalSanctum
{
    public function handle(Request $request, Closure $next)
    {
        $auth = $request->header('Authorization');
        if ($auth && str_starts_with($auth, 'Bearer ')) {
            $token = substr($auth, 7);
            if ($pat = PersonalAccessToken::findToken($token)) {
                $user = $pat->tokenable;
                Auth::shouldUse('sanctum');
                Auth::setUser($user);
                if (method_exists($user, 'withAccessToken')) {
                    $user->withAccessToken($pat);
                }
            }
        }
        return $next($request);
    }
}
