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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('address_id')->nullable()->constrained('address_users')->nullOnDelete();
            $table->decimal('sub_total', 10, 2);
            $table->foreignId('shipping_id')->nullable()->constrained('shippings')->nullOnDelete();
            $table->decimal('coupon', 10, 2)->nullable();
            $table->integer('quantity');
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_method', ['cod', 'razorpay', 'paytm', 'others'])->default('cod');
            $table->enum('payment_status', ['paid', 'unpaid'])->default('unpaid');
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->string('transaction_id')->nullable();
            $table->timestamps();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
