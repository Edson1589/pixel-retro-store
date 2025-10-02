<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuth;
use App\Http\Controllers\Api\Admin\ProductController as AdminProducts;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategories;
use App\Http\Controllers\Api\EventController as PublicEvents;
use App\Http\Controllers\Api\Admin\EventController as AdminEvents;
use App\Http\Controllers\Api\Admin\EventRegistrationController as AdminEventRegs;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\Customer\OrderController as CustomerOrders;
use App\Http\Controllers\Api\CategoryController as PublicCategories;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\SearchHistoryController;

// ========================
// Rutas de administración
// ========================
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuth::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AdminAuth::class, 'logout']);

        // Categorías (admin)
        Route::get('/categories', [AdminCategories::class, 'index']);
        Route::get('/categories/{id}', [AdminCategories::class, 'show']);
        Route::post('/categories', [AdminCategories::class, 'store']);
        Route::put('/categories/{id}', [AdminCategories::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategories::class, 'destroy']);

        // Productos (admin)
        Route::get('/products', [AdminProducts::class, 'index']);
        Route::post('/products', [AdminProducts::class, 'store']);
        Route::get('/products/{id}', [AdminProducts::class, 'show']);
        Route::post('/products/{id}', [AdminProducts::class, 'update']);
        Route::delete('/products/{id}', [AdminProducts::class, 'destroy']);

        // Eventos (admin)
        Route::get('/events', [AdminEvents::class, 'index']);
        Route::post('/events', [AdminEvents::class, 'store']);
        Route::get('/events/{id}', [AdminEvents::class, 'show']);
        Route::post('/events/{id}', [AdminEvents::class, 'update']);
        Route::delete('/events/{id}', [AdminEvents::class, 'destroy']);

        // Registro de eventos (admin)
        Route::get('/events/{id}/registrations', [AdminEventRegs::class, 'index']);
        Route::post('/events/{id}/registrations/{regId}/status', [AdminEventRegs::class, 'updateStatus']);
    });
});

// ========================
// Rutas públicas
// ========================

// Productos (público)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Checkout
Route::post('/checkout', [CheckoutController::class, 'checkout']);

// Eventos (público)
Route::get('/events', [PublicEvents::class, 'index']);
Route::get('/events/{slug}', [PublicEvents::class, 'show']);
Route::post('/events/{slug}/register', [PublicEvents::class, 'register']);

// Categorías (público)
Route::get('/categories', [PublicCategories::class, 'index']);

// ========================
// Historial de búsqueda (público o logueado)
// ========================
Route::get('/search-history', [SearchHistoryController::class, 'index']);
Route::post('/search-history', [SearchHistoryController::class, 'store']);

// ========================
// Pagos
// ========================
Route::post('/payments/intents', [PaymentController::class, 'createIntent']);
Route::post('/payments/intents/{intentId}/confirm', [PaymentController::class, 'confirmIntent']);
Route::post('/payments/intents/{intentId}/3ds/verify', [PaymentController::class, 'verify3ds']);

// ========================
// Autenticación cliente
// ========================
Route::post('/auth/register', [CustomerAuthController::class, 'register']);
Route::post('/auth/login',    [CustomerAuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/auth/me',      [CustomerAuthController::class, 'me']);
    Route::post('/auth/logout', [CustomerAuthController::class, 'logout']);

    // Pagos (protegidos)
    Route::post('/payments/intents', [PaymentController::class, 'createIntent']);
    Route::post('/payments/intents/{intentId}/confirm', [PaymentController::class, 'confirmIntent']);
    Route::post('/payments/intents/{intentId}/3ds/verify', [PaymentController::class, 'verify3ds']);

    // Registro en eventos (logueado)
    Route::post('/events/{slug}/register', [PublicEvents::class, 'register']);

    // Carrito
    Route::get('/cart', [CartController::class, 'get']);
    Route::put('/cart', [CartController::class, 'put']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{productId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{productId}', [CartController::class, 'removeItem']);
    Route::post('/cart/clear', [CartController::class, 'clear']);

    // Pedidos del cliente
    Route::get('/me/orders', [CustomerOrders::class, 'index']);
    Route::get('/me/orders/{id}', [CustomerOrders::class, 'show']);
    Route::get('/account/orders/{sale}/receipt', [ReceiptController::class, 'download']);
});
