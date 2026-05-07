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
        Schema::create('error_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained()->onDelete('cascade');
            $table->string('error_code', 10); // 404, 500, 403, etc
            $table->longText('content'); // HTML content
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['domain_id', 'error_code']); // One error page per code per domain
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('error_pages');
    }
};
