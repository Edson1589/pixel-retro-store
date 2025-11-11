<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('service_type', ['repair', 'maintenance', 'diagnostic']);
            $table->string('console', 40);
            $table->text('problem_description');

            $table->enum('location', ['shop', 'home']);
            $table->string('address')->nullable();

            $table->string('contact_phone', 40);

            $table->dateTime('preferred_at');
            $table->dateTime('scheduled_at')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->default(60);

            $table->enum('status', [
                'pending',
                'confirmed',
                'rejected',
                'rescheduled',
                'completed',
                'cancelled',
            ])->default('pending');

            $table->dateTime('reschedule_proposed_at')->nullable();
            $table->string('reschedule_note', 255)->nullable();

            $table->string('reject_reason', 255)->nullable();

            $table->string('customer_notes', 255)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['technician_id', 'scheduled_at']);
            $table->index(['status', 'preferred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
