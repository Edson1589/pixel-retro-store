<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_descriptors', function (Blueprint $t) {
            $t->unsignedBigInteger('user_id');
            $t->string('key');
            $t->float('score')->default(0);
            $t->timestamps();

            $t->primary(['user_id', 'key']);
            $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('user_descriptors');
    }
};
