<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('email', 255);
            $table->string('gamer_tag', 80)->nullable();
            $table->string('team', 120)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->unique(['event_id', 'email']); // evita registros duplicados por email
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
    }
};
