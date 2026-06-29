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
        Schema::create('gift_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->unsignedBigInteger('product_id'); // gift product/variant ID
            $table->string('product_type'); // 'main' or 'variant'
            $table->string('offer_type')->default('free'); // 'free' or 'discounted'
            $table->decimal('offered_price', 10, 2)->default(0.00);
            $table->string('status')->default('active'); // 'active' or 'inactive'
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->decimal('min_spend', 10, 2)->nullable();
            $table->integer('min_quantity')->nullable();
            $table->string('eligibility_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_items');
    }
};
