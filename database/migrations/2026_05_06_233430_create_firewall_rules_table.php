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
        Schema::create('firewall_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('domain_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('type', ['allow', 'deny'])->default('deny');
            $table->string('source'); // IP address or CIDR
            $table->string('port')->nullable(); // port or port range
            $table->enum('protocol', ['tcp', 'udp', 'all'])->default('all');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('firewall_rules');
    }
};
