<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ftp_users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('domain_id')->nullable();
            $table->foreign('domain_id')->references('id')->on('domains')->onDelete('cascade');
            $table->string('username')->unique();
            $table->string('password'); // will store encrypted password
            $table->integer('quota_mb')->default(0); // 0 = unlimited
            $table->string('directory')->nullable(); // home directory
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ftp_users');
    }
};
