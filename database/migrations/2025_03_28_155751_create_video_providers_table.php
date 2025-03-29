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
        Schema::create('video_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Provider name (e.g., YouTube, Vimeo)
            $table->string('base_url'); // Base URL for embedding videos
            $table->string('logo')->nullable(); // Logo of the provider
            $table->enum('status', ['active', 'inactive'])->default('active'); // Status control
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_providers');
    }
};
