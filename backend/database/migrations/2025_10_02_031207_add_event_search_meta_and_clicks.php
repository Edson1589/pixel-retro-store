<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('event_search_meta', function (Blueprint $t) {
            $t->unsignedBigInteger('event_id')->primary();
            $t->unsignedInteger('clicks')->default(0);
            $t->timestamp('last_clicked_at')->nullable();
            $t->timestamps();

            $t->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
        });

        Schema::create('search_clicks_events', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedBigInteger('event_id');
            $t->string('q');
            $t->json('terms');
            $t->string('source')->nullable();
            $t->timestamps();

            $t->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $t->index(['event_id']);
            $t->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_clicks_events');
        Schema::dropIfExists('event_search_meta');
    }
};
