<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('spam_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('domain_id')->nullable()->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('email_id')->nullable();
            $table->decimal('spam_threshold', 3, 1)->default(5.0);
            $table->enum('action_on_spam', ['move_to_junk', 'delete', 'flag'])->default('move_to_junk');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('spam_settings');
    }
};
