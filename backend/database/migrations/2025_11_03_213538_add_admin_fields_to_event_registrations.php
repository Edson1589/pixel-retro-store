<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            if (!Schema::hasColumn('event_registrations', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->after('event_id');
            }

            $table->string('source', 20)->nullable()->after('notes');
            $table->foreignId('created_by_admin_id')->nullable()
                ->constrained('users')->nullOnDelete()->after('source');

            $table->timestamp('checked_in_at')->nullable()->after('ticket_issued_at');
            $table->foreignId('checked_in_by')->nullable()
                ->constrained('users')->nullOnDelete()->after('checked_in_at');

            $table->index(['event_id', 'status']);
            $table->index(['email']);
            $table->index(['gamer_tag']);
        });
    }

    public function down(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            if (Schema::hasColumn('event_registrations', 'checked_in_by')) {
                $table->dropConstrainedForeignId('checked_in_by');
            }
            if (Schema::hasColumn('event_registrations', 'created_by_admin_id')) {
                $table->dropConstrainedForeignId('created_by_admin_id');
            }
            if (Schema::hasColumn('event_registrations', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
            $table->dropColumn(['source', 'checked_in_at']);
            $table->dropIndex(['event_id', 'status']);
            $table->dropIndex(['email']);
            $table->dropIndex(['gamer_tag']);
        });
    }
};
