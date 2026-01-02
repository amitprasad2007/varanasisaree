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
        Schema::create('credit_notes', function (Blueprint $table) {
            $table->id();
            $table->string('credit_note_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('refund_id')->nullable()->constrained('refunds')->nullOnDelete();
            // NOTE: orders table is created later in the migration timeline.
            // Avoid foreign key constraints here to prevent migration-order failures.
            $table->unsignedBigInteger('order_id')->nullable();
            $table->index('order_id');
            $table->decimal('amount', 12, 2);
            $table->decimal('used_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2);
            $table->enum('status', ['active', 'used', 'expired', 'cancelled'])->default('active');
            $table->date('issued_at');
            $table->date('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_notes');
    }
};
