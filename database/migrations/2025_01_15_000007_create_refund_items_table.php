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
        Schema::create('refund_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('refund_id')->constrained('refunds')->cascadeOnDelete();
            $table->foreignId('sale_return_item_id')->nullable()->constrained('sale_return_items')->nullOnDelete();
            // NOTE: order_items/products/product_variants tables are created later in the migration timeline.
            // Avoid foreign key constraints here to prevent migration-order failures.
            $table->unsignedBigInteger('order_item_id')->nullable();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('product_variant_id')->nullable();
            $table->index('order_item_id');
            $table->index('product_id');
            $table->index('product_variant_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reason')->nullable();
            $table->enum('qc_status', ['pending', 'passed', 'failed'])->default('pending');
            $table->text('qc_notes')->nullable();
            $table->timestamps();

            $table->index(['refund_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_items');
    }
};
