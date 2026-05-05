<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dns_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained('domains')->onDelete('cascade');
            $table->string('type', 10); // A, AAAA, CNAME, MX, TXT, etc.
            $table->string('name'); // subdomain or @
            $table->text('content'); // IP address, target, etc.
            $table->integer('ttl')->default(3600);
            $table->integer('priority')->nullable(); // for MX records
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dns_records');
    }
};
