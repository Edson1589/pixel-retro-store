<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('event_id')
                ->constrained('users')->nullOnDelete();
            $table->unique(['event_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            $table->dropUnique('event_registrations_event_id_user_id_unique');
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
