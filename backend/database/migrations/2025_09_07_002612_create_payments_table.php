<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->string('provider')->default('simulator'); // por si luego usas stripe/mp
            $t->string('intent_id')->unique();            // público: pi_xxx
            $t->string('client_secret')->unique();        // sec_xxx
            $t->unsignedInteger('amount');                // centavos (evita floats)
            $t->string('currency', 10)->default('BOB');

            // estado general
            $t->string('status', 40)->default('requires_confirmation');
            // motivo si falla
            $t->string('failure_reason')->nullable();

            // info de método (simulado)
            $t->string('method', 20)->default('card'); // de momento, solo "card"
            $t->string('brand', 20)->nullable();       // visa/mastercard
            $t->string('last4', 4)->nullable();

            // 3DS
            $t->boolean('requires_action')->default(false);
            $t->string('next_action', 20)->nullable(); // otp | redirect
            $t->timestamp('expires_at')->nullable();

            // relación opcional a la venta (no tocamos 'sales')
            $t->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();

            // payload de referencia (items, email, etc.)
            $t->json('metadata')->nullable();

            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
