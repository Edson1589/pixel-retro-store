<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('search_terms', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('term')->unique();
            $t->unsignedInteger('df')->default(0);
            $t->unsignedInteger('search_weight')->default(0);
            $t->timestamp('last_searched_at')->nullable();
            $t->timestamps();
        });

        Schema::create('product_terms', function (Blueprint $t) {
            $t->unsignedBigInteger('product_id');
            $t->unsignedBigInteger('term_id');
            $t->unsignedSmallInteger('in_name')->default(0);
            $t->unsignedSmallInteger('in_description')->default(0);
            $t->unsignedSmallInteger('in_sku')->default(0);
            $t->timestamps();

            $t->primary(['product_id', 'term_id']);
            $t->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $t->foreign('term_id')->references('id')->on('search_terms')->onDelete('cascade');
        });

        Schema::create('search_queries', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('q');
            $t->json('terms');
            $t->unsignedInteger('results_count')->default(0);
            $t->unsignedBigInteger('clicked_product_id')->nullable();
            $t->timestamps();
        });

        Schema::table('products', function (Blueprint $t) {
            $t->fullText(['name', 'description'], 'ft_products_name_desc');
            $t->fullText('sku', 'ft_products_sku');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {});
        Schema::dropIfExists('search_queries');
        Schema::dropIfExists('product_terms');
        Schema::dropIfExists('search_terms');
    }
};
