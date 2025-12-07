<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('event_descriptors', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('key')->unique();
            $t->string('label')->nullable();
            $t->json('aliases')->nullable();
            $t->float('weight')->default(1.0);
            $t->timestamps();
        });

        Schema::create('event_descriptors_map', function (Blueprint $t) {
            $t->unsignedBigInteger('event_id');
            $t->unsignedBigInteger('descriptor_id');
            $t->float('score')->default(0);
            $t->string('source')->default('auto');
            $t->timestamp('indexed_at')->nullable();

            $t->primary(['event_id', 'descriptor_id']);
            $t->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $t->foreign('descriptor_id')->references('id')->on('event_descriptors')->onDelete('cascade');

            $t->index(['descriptor_id', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_descriptors_map');
        Schema::dropIfExists('event_descriptors');
    }
};
