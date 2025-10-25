<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->unsignedInteger('searches_count')->default(0)->after('status');
            $t->unsignedInteger('preferences_count')->default(0)->after('searches_count');
        });
    }
    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn(['searches_count', 'preferences_count']);
        });
    }
};
