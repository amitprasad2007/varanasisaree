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
        Schema::create('refund_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('refund_id')->constrained('refunds')->cascadeOnDelete();
            $table->string('transaction_id')->unique();
            $table->enum('gateway', ['razorpay', 'stripe', 'paytm', 'manual', 'bank_transfer'])->default('manual');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('gateway_transaction_id')->nullable();
            $table->string('gateway_refund_id')->nullable();
            $table->json('gateway_response')->nullable();
            $table->text('failure_reason')->nullable();
            $table->string('bank_reference')->nullable();
            $table->string('payout_proof')->nullable(); // File path for bank transfer proof
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['refund_id', 'status']);
            $table->index(['gateway', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_transactions');
    }
};
