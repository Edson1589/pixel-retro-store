<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->boolean('is_service')->default(false)->after('is_unique');
        });
    }
    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn('is_service');
        });
    }
};
