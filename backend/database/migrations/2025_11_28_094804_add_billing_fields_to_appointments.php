<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $t) {
            $t->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $t->decimal('service_amount', 10, 2)->default(0);
            $t->decimal('parts_total', 10, 2)->default(0);
            $t->decimal('discount', 10, 2)->default(0);
            $t->decimal('grand_total', 10, 2)->default(0);
            $t->timestamp('completed_at')->nullable();
            $t->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $t) {
            $t->dropConstrainedForeignId('sale_id');
            $t->dropColumn(['service_amount', 'parts_total', 'discount', 'grand_total', 'completed_at']);
            $t->dropConstrainedForeignId('completed_by');
        });
    }
};
