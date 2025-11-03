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

use App\Http\Controllers\Api\SearchTelemetryController;

use App\Http\Controllers\Api\ProductPreferenceController;
use App\Http\Controllers\Api\EventPreferenceController;
use App\Http\Controllers\Api\UserSignalsController;

use App\Http\Controllers\Api\Admin\SaleController;

use App\Http\Controllers\Api\Admin\PosController;

use App\Http\Controllers\Api\Admin\PosSaleController;

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuth::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AdminAuth::class, 'logout']);

        Route::get('pos/products', [PosController::class, 'searchProducts']);
        Route::get('pos/customers', [PosController::class, 'searchCustomers']);
        Route::post('pos/sales', [PosController::class, 'store']);

        Route::get('sales/{sale}/receipt', [SaleController::class, 'receipt'])
            ->whereNumber('sale')->name('admin.sales.receipt');

        Route::post('pos/sales', [PosSaleController::class, 'store']);

        Route::get('sales/summary', [SaleController::class, 'summary']);
        Route::get('sales/export',  [SaleController::class, 'export']);
        Route::get('sales', [SaleController::class, 'index']);
        Route::get('sales/{sale}', [SaleController::class, 'show']);
        Route::patch('sales/{sale}/status', [SaleController::class, 'updateStatus']);

        Route::patch('sales/{sale}/deliver', [SaleController::class, 'markDelivered'])
            ->whereNumber('sale');

        Route::get('sales/{sale}/delivery-note', [SaleController::class, 'deliveryNote'])
            ->whereNumber('sale')->name('admin.sales.delivery-note');

        Route::post('sales/{sale}/void', [SaleController::class, 'void'])
            ->whereNumber('sale');

        Route::get('/categories', [AdminCategories::class, 'index']);
        Route::get('/categories/{id}', [AdminCategories::class, 'show']);
        Route::post('/categories', [AdminCategories::class, 'store']);
        Route::put('/categories/{id}', [AdminCategories::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategories::class, 'destroy']);

        Route::get('/products', [AdminProducts::class, 'index']);
        Route::post('/products', [AdminProducts::class, 'store']);
        Route::get('/products/{id}', [AdminProducts::class, 'show']);
        Route::post('/products/{id}', [AdminProducts::class, 'update']);
        Route::delete('/products/{id}', [AdminProducts::class, 'destroy']);

        Route::get('/events', [AdminEvents::class, 'index']);
        Route::post('/events', [AdminEvents::class, 'store']);
        Route::get('/events/{id}', [AdminEvents::class, 'show']);
        Route::post('/events/{id}', [AdminEvents::class, 'update']);
        Route::delete('/events/{id}', [AdminEvents::class, 'destroy']);

        Route::get('/events/{id}/registrations', [AdminEventRegs::class, 'index']);
        Route::post('/events/{id}/registrations/{regId}/status', [AdminEventRegs::class, 'updateStatus']);
    });
});

Route::middleware('optional.sanctum')->get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::post('/checkout', [CheckoutController::class, 'checkout']);

Route::get('/events', [PublicEvents::class, 'index']);
Route::get('/events/{slug}', [PublicEvents::class, 'show']);
Route::post('/events/{slug}/register', [PublicEvents::class, 'register']);
Route::get('/{slug}/my-registration', [PublicEvents::class, 'myRegistration']);

Route::get('/categories', [PublicCategories::class, 'index']);

Route::post('/payments/intents', [PaymentController::class, 'createIntent']);
Route::post('/payments/intents/{intentId}/confirm', [PaymentController::class, 'confirmIntent']);
Route::post('/payments/intents/{intentId}/3ds/verify', [PaymentController::class, 'verify3ds']);

Route::post('/auth/register', [CustomerAuthController::class, 'register']);
Route::post('/auth/login',    [CustomerAuthController::class,  'login']);

Route::get('admin/sales/{sale}/pickup-doc', [SaleController::class, 'pickupDoc'])
    ->name('admin.sales.pickupDoc');

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/auth/me',     [CustomerAuthController::class, 'me']);
    Route::post('/auth/logout', [CustomerAuthController::class, 'logout']);

    Route::post('/payments/intents', [PaymentController::class, 'createIntent']);
    Route::post('/payments/intents/{intentId}/confirm', [PaymentController::class, 'confirmIntent']);
    Route::post('/payments/intents/{intentId}/3ds/verify', [PaymentController::class, 'verify3ds']);

    Route::post('/events/{slug}/register', [PublicEvents::class, 'register']);

    Route::get('/cart', [CartController::class, 'get']);
    Route::put('/cart', [CartController::class, 'put']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{productId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{productId}', [CartController::class, 'removeItem']);
    Route::post('/cart/clear', [CartController::class, 'clear']);

    Route::get('/me/orders', [CustomerOrders::class, 'index']);
    Route::get('/me/orders/{id}', [CustomerOrders::class, 'show']);
    Route::get('/account/orders/{sale}/receipt', [ReceiptController::class, 'download']);

    Route::post('/me/products/interact', [UserSignalsController::class, 'interact']);
});

Route::post('/products/search/click', [SearchTelemetryController::class, 'productClick'])
    ->middleware('throttle:60,1');

Route::post('/events/search/click', [SearchTelemetryController::class, 'eventClick'])
    ->middleware('throttle:60,1');

Route::post('/products/{id}/prefer', [ProductPreferenceController::class, 'prefer'])
    ->whereNumber('id')
    ->middleware('throttle:120,1');

Route::post('/events/{id}/prefer', [EventPreferenceController::class, 'prefer'])
    ->whereNumber('id')
    ->middleware('throttle:120,1');
