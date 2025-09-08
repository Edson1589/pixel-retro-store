<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Equivalente a: protected $routeMiddleware = [...]
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);

        // (Opcional) agregar globales o grupos:
        // $middleware->append(\App\Http\Middleware\EnsureSomething::class);
        // $middleware->web(append: [\App\Http\Middleware\Foo::class]);
        // $middleware->api(prepend: [\App\Http\Middleware\Bar::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Equivalente al antiguo Handler::render para AuthenticationException
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->guest(route('login'));
        });

        // (Opcional) Si quieres que TODAS las excepciones en /api/* respondan JSON:
        // $exceptions->shouldReturnJson(
        //     fn (Request $request, Throwable $e) => $request->is('api/*')
        // );
    })
    ->create();
