<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('session_token', 64)->nullable()->index();
            $table->string('event', 64);
            $table->json('meta')->nullable();
            $table->ipAddress('ip')->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['session_token', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_logs');
    }
};


