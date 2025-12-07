<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_search_meta', function (Blueprint $t) {
            $t->unsignedBigInteger('product_id')->primary();
            $t->unsignedInteger('clicks')->default(0);
            $t->timestamp('last_clicked_at')->nullable();
            $t->timestamps();

            $t->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::create('search_clicks', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedBigInteger('product_id');
            $t->string('q');
            $t->json('terms');
            $t->string('source')->nullable();
            $t->timestamps();

            $t->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $t->index(['product_id']);
            $t->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_clicks');
        Schema::dropIfExists('product_search_meta');
    }
};
