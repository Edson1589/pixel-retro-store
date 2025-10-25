<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('search_terms_events', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('term')->unique();
            $t->unsignedInteger('df')->default(0);
            $t->unsignedInteger('search_weight')->default(0);
            $t->timestamp('last_searched_at')->nullable();
            $t->timestamps();
        });

        Schema::create('event_terms', function (Blueprint $t) {
            $t->unsignedBigInteger('event_id');
            $t->unsignedBigInteger('term_id');
            $t->unsignedSmallInteger('in_title')->default(0);
            $t->unsignedSmallInteger('in_description')->default(0);
            $t->unsignedSmallInteger('in_location')->default(0);
            $t->timestamps();

            $t->primary(['event_id', 'term_id']);
            $t->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $t->foreign('term_id')->references('id')->on('search_terms_events')->onDelete('cascade');
        });

        Schema::create('search_queries_events', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->string('q');
            $t->json('terms');
            $t->unsignedInteger('results_count')->default(0);
            $t->unsignedBigInteger('clicked_event_id')->nullable();
            $t->timestamps();
        });

        Schema::table('events', function (Blueprint $t) {
            $t->fullText(['title', 'description', 'location'], 'ft_events_all');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_queries_events');
        Schema::dropIfExists('event_terms');
        Schema::dropIfExists('search_terms_events');
    }
};
