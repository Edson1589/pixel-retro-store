<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_histories', function (Blueprint $table) {
            $table->id();

            // Si el usuario está logueado, guardamos el user_id
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

            // Si es anónimo, lo distinguimos con session_id
            $table->string('session_id', 64)->nullable()->index();

            // término de búsqueda
            $table->string('term');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_histories');
    }
};
