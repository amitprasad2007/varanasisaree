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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Product name
            $table->string('slug')->unique(); // SEO-friendly slug
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('discount', 5, 2)->default(0.00);
            $table->integer('stock_quantity')->default(0);
            $table->string('fabric')->nullable(); // Fabric type (Silk, Cotton, etc.)
            $table->string('color')->nullable();
            $table->string('size')->nullable(); // Sizes for Kurtis, etc.
            $table->string('work_type')->nullable(); // Embroidery, Printed, etc.
            $table->string('occasion')->nullable(); // Wedding, Casual, etc.
            $table->decimal('weight', 5, 2)->nullable(); // In kg
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('is_bestseller')->default(false); // Bestseller flag
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
