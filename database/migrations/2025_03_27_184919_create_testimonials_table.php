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
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('photo')->nullable();
            $table->text('testimonial');
            $table->text('testimonial_hi')->nullable(); // Keep Hindi translation support
            $table->integer('rating')->default(5)->comment('Rating value from 1 to 5');
            $table->string('designation')->nullable();
            $table->string('company')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('inactive');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
