<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->string('ssl_status')->default('none'); // none, pending, active, expired
            $table->string('ssl_issuer')->nullable();
            $table->timestamp('ssl_valid_from')->nullable();
            $table->timestamp('ssl_valid_to')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['ssl_status', 'ssl_issuer', 'ssl_valid_from', 'ssl_valid_to']);
        });
    }
};
