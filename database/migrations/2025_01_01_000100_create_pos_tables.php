<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('gstin')->nullable();
            $table->timestamps();
        });

        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('invoice_number')->unique();
            $table->enum('status', ['draft', 'completed', 'returned'])->default('draft');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->enum('discount_type', ['percent', 'fixed'])->nullable();
            $table->decimal('discount_value', 12, 2)->nullable();
            $table->decimal('tax_percent', 6, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('paid_total', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            // NOTE: products/product_variants tables are created later in the migration timeline.
            // Avoid foreign key constraints here to prevent migration-order failures.
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('product_variant_id')->nullable();
            $table->index('product_id');
            $table->index('product_variant_id');
            $table->string('name');
            $table->string('sku')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('price', 12, 2); // unit price before discount/tax
            $table->decimal('line_total', 12, 2); // quantity * price (pre discount/tax)
            $table->timestamps();
        });

        Schema::create('sale_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->string('method'); // cash, card, upi, etc.
            $table->decimal('amount', 12, 2);
            $table->string('reference')->nullable();
            $table->timestamps();
        });

        Schema::create('sale_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->string('reason')->nullable();
            $table->decimal('refund_total', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('sale_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_return_id')->constrained('sale_returns')->cascadeOnDelete();
            $table->foreignId('sale_item_id')->nullable()->constrained('sale_items')->nullOnDelete();
            // NOTE: products/product_variants tables are created later in the migration timeline.
            // Avoid foreign key constraints here to prevent migration-order failures.
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('product_variant_id')->nullable();
            $table->index('product_id');
            $table->index('product_variant_id');
            $table->unsignedInteger('quantity');
            $table->decimal('amount', 12, 2); // refunded amount for these items
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_return_items');
        Schema::dropIfExists('sale_returns');
        Schema::dropIfExists('sale_payments');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('customers');
    }
};


