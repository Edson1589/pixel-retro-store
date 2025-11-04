<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'seller', 'technician', 'customer'])
                    ->default('customer')->after('password');
            } else {
            }

            if (Schema::hasColumn('users', 'is_admin')) {
                $table->dropColumn('is_admin');
            }

            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('role');
            }
            if (!Schema::hasColumn('users', 'temp_password_expires_at')) {
                $table->timestamp('temp_password_expires_at')->nullable()->after('must_change_password');
            }
            if (!Schema::hasColumn('users', 'created_by_admin_id')) {
                $table->foreignId('created_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable();
            }

            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'must_change_password')) $table->dropColumn('must_change_password');
            if (Schema::hasColumn('users', 'temp_password_expires_at')) $table->dropColumn('temp_password_expires_at');
            if (Schema::hasColumn('users', 'created_by_admin_id')) $table->dropConstrainedForeignId('created_by_admin_id');
            if (Schema::hasColumn('users', 'last_login_at')) $table->dropColumn('last_login_at');
            if (Schema::hasColumn('users', 'deleted_at')) $table->dropSoftDeletes();
        });
    }
};
