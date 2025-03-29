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
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question'); // Stores the FAQ question
            $table->text('answer'); // Stores the FAQ answer
            $table->integer('order')->default(0); // Order for sorting FAQs
            $table->enum('status', ['active', 'inactive'])->default('active'); // FAQ visibility status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
