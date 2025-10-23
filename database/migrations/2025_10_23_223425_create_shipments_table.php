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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('address_id')->constrained('address_users')->onDelete('cascade');
            $table->string('awb_number')->unique();
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable(); // e.g., 'FedEx', 'DHL', 'Blue Dart'
            $table->string('service_type')->nullable(); // e.g., 'Express', 'Standard', 'Economy'
            $table->enum('status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'])->default('pending');
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('in_transit_at')->nullable();
            $table->timestamp('out_for_delivery_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->text('shipping_notes')->nullable();
            $table->json('tracking_events')->nullable(); // Store tracking history
            $table->decimal('weight', 8, 2)->nullable(); // Package weight
            $table->decimal('dimensions_length', 8, 2)->nullable();
            $table->decimal('dimensions_width', 8, 2)->nullable();
            $table->decimal('dimensions_height', 8, 2)->nullable();
            $table->decimal('shipping_cost', 10, 2)->nullable();
            $table->string('delivery_attempts')->default(0);
            $table->text('delivery_notes')->nullable();
            $table->string('signature_required')->default(false);
            $table->string('signature_name')->nullable();
            $table->json('metadata')->nullable(); // Additional shipping data
            $table->timestamps();
            
            $table->index(['order_id', 'status']);
            $table->index(['awb_number']);
            $table->index(['tracking_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
