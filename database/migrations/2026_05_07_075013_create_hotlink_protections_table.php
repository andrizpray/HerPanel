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
        Schema::create('hotlink_protections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained()->onDelete('cascade');
            $table->boolean('is_enabled')->default(false);
            $table->text('allowed_domains')->nullable(); // JSON array of allowed domains
            $table->text('protected_extensions')->nullable(); // JSON array of file extensions
            $table->string('redirect_url')->nullable();
            $table->timestamps();
            
            $table->unique('domain_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotlink_protections');
    }
};
