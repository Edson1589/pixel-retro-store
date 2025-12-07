<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('events', function (Blueprint $t) {
            $t->unsignedInteger('searches_count')->default(0)->after('status');
            $t->unsignedInteger('preferences_count')->default(0)->after('searches_count');

            $t->index(['status', 'start_at']);
            $t->index(['type', 'start_at']);
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $t) {
            $t->dropIndex(['status', 'start_at']);
            $t->dropIndex(['type', 'start_at']);
            $t->dropColumn(['searches_count', 'preferences_count']);
        });
    }
};
