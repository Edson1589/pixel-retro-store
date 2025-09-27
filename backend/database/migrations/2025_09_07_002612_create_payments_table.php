<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->string('provider')->default('simulator');
            $t->string('intent_id')->unique();
            $t->string('client_secret')->unique();
            $t->unsignedInteger('amount');
            $t->string('currency', 10)->default('BOB');

            $t->string('status', 40)->default('requires_confirmation');
            $t->string('failure_reason')->nullable();

            $t->string('method', 20)->default('card');
            $t->string('brand', 20)->nullable();
            $t->string('last4', 4)->nullable();

            $t->boolean('requires_action')->default(false);
            $t->string('next_action', 20)->nullable();
            $t->timestamp('expires_at')->nullable();

            $t->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();

            $t->json('metadata')->nullable();

            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
