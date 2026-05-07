<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('virtual_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained()->onDelete('cascade');
            $table->string('email')->unique();
            $table->string('password'); // SHA512-CRYPT or other encryption for Postfix/Dovecot
            $table->integer('quota_mb')->default(1024); // default 1GB
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtual_users');
    }
};
