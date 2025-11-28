<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('delivered_to_ci', 50)->nullable()->after('delivered_by');
            $table->string('delivered_to_name', 150)->nullable()->after('delivered_to_ci');
            $table->string('delivery_notes', 500)->nullable()->after('delivered_to_name');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['delivered_to_ci', 'delivered_to_name', 'delivery_notes']);
        });
    }
};
