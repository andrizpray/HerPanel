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
        Schema::create('apps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('domain_id')->nullable();
            $table->foreign('domain_id')->references('id')->on('domains')->onDelete('cascade');
            $table->enum('type', ['nodejs', 'python']);
            $table->string('name');
            $table->string('path'); // application root
            $table->integer('port')->nullable(); // for Node.js
            $table->string('entry_file')->nullable(); // for Python (e.g., app.py)
            $table->enum('status', ['active', 'stopped', 'error'])->default('stopped');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
