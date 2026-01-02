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
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            // NOTE: orders table is created later in the migration timeline.
            // Avoid foreign key constraints here to prevent migration-order failures.
            $table->unsignedBigInteger('order_id');
            $table->index('order_id');
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('refunded_amount', 12, 2)->default(0);
            $table->enum('refund_type', ['credit_note', 'money'])->default('credit_note');
            $table->enum('refund_status', ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('reason');
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('refund_details')->nullable(); // Store additional refund-specific data
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['refund_status', 'created_at']);
            $table->index(['customer_id', 'refund_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
