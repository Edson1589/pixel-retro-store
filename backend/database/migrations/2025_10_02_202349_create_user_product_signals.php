<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_product_signals', function (Blueprint $t) {
            $t->unsignedBigInteger('user_id');
            $t->unsignedBigInteger('product_id');
            $t->unsignedInteger('impressions')->default(0);
            $t->unsignedInteger('views')->default(0);
            $t->unsignedInteger('adds')->default(0);
            $t->unsignedInteger('purchases')->default(0);
            $t->timestamp('last_interacted_at')->nullable();
            $t->timestamps();

            $t->primary(['user_id', 'product_id']);
            $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $t->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $t->index('last_interacted_at');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('user_product_signals');
    }
};
