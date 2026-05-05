<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('databases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('db_name');
            $table->string('db_user');
            $table->string('db_password');
            $table->string('character_set')->default('utf8mb4');
            $table->string('collation')->default('utf8mb4_unicode_ci');
            $table->timestamps();
            
            $table->unique(['user_id', 'db_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('databases');
    }
};
