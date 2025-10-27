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
        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                // Add sale_id for POS refunds
                if (!Schema::hasColumn('refunds', 'sale_id')) {
                    $table->foreignId('sale_id')->nullable()->after('id')->constrained('sales')->nullOnDelete();
                }
                
                // Add sale_return_id
                if (!Schema::hasColumn('refunds', 'sale_return_id')) {
                    $table->foreignId('sale_return_id')->nullable()->after('order_id')->constrained('sale_returns')->nullOnDelete();
                }
                
                // Add credit_note_id
                if (!Schema::hasColumn('refunds', 'credit_note_id')) {
                    $table->foreignId('credit_note_id')->nullable()->after('sale_return_id')->constrained('credit_notes')->nullOnDelete();
                }
                
                // Add reference
                if (!Schema::hasColumn('refunds', 'reference')) {
                    $table->string('reference')->nullable()->after('customer_id');
                }
                
                // Add method
                if (!Schema::hasColumn('refunds', 'method')) {
                    $table->string('method')->nullable()->after('refund_type');
                }
                
                // Add status (mapping to refund_status)
                if (!Schema::hasColumn('refunds', 'status')) {
                    $table->string('status')->nullable()->after('refund_status');
                }
                
                // Add paid_at
                if (!Schema::hasColumn('refunds', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('completed_at');
                }
            });
            
            // Make order_id nullable
            if (Schema::hasColumn('refunds', 'order_id') && Schema::getColumnType('refunds', 'order_id') !== 'NULL') {
                Schema::table('refunds', function (Blueprint $table) {
                    $table->foreignId('order_id')->nullable()->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                $table->dropForeign(['sale_id']);
                $table->dropForeign(['sale_return_id']);
                $table->dropForeign(['credit_note_id']);
                $table->dropColumn(['sale_id', 'sale_return_id', 'credit_note_id', 'reference', 'method', 'status', 'paid_at']);
            });
        }
    }
};

