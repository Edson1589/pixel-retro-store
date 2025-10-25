<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('descriptors', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('key')->unique();
            $t->string('label')->nullable();
            $t->json('aliases')->nullable();
            $t->float('weight')->default(1.0);
            $t->timestamps();
        });

        Schema::create('product_descriptors', function (Blueprint $t) {
            $t->unsignedBigInteger('product_id');
            $t->unsignedBigInteger('descriptor_id');
            $t->float('score')->default(0);
            $t->string('source')->default('auto');
            $t->timestamp('indexed_at')->nullable();

            $t->primary(['product_id', 'descriptor_id']);
            $t->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $t->foreign('descriptor_id')->references('id')->on('descriptors')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_descriptors');
        Schema::dropIfExists('descriptors');
    }
};
