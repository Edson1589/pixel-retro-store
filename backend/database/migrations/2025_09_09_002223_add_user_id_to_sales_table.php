<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $t) {
            $t->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $t->index(['user_id', 'created_at']);
        });
    }
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $t) {
            $t->dropIndex(['user_id', 'created_at']);
            $t->dropConstrainedForeignId('user_id');
        });
    }
};
