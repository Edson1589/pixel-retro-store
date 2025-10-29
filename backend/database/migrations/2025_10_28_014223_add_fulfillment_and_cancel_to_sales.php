<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $t) {
            $t->enum('delivery_status', ['to_deliver', 'delivered'])
                ->default('to_deliver')
                ->after('status');
            $t->timestamp('delivered_at')->nullable()->after('delivery_status');
            $t->foreignId('delivered_by')->nullable()->constrained('users')->nullOnDelete();

            $t->boolean('is_canceled')->default(false)->after('delivered_by');
            $t->timestamp('canceled_at')->nullable()->after('is_canceled');
            $t->foreignId('canceled_by')->nullable()->constrained('users')->nullOnDelete();
            $t->text('cancel_reason')->nullable()->after('canceled_by');

            $t->index('delivery_status');
            $t->index('is_canceled');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $t) {
            $t->dropIndex(['delivery_status']);
            $t->dropIndex(['is_canceled']);
            $t->dropConstrainedForeignId('delivered_by');
            $t->dropConstrainedForeignId('canceled_by');
            $t->dropColumn([
                'delivery_status',
                'delivered_at',
                'is_canceled',
                'canceled_at',
                'cancel_reason'
            ]);
        });
    }
};
