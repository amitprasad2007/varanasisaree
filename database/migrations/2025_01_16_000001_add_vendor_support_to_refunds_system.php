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
        // Add vendor support to refunds table
        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                if (!Schema::hasColumn('refunds', 'vendor_id')) {
                    $table->foreignId('vendor_id')->nullable()->after('customer_id')->constrained('vendors')->nullOnDelete();
                    $table->index('vendor_id');
                }
                
                // Add missing fields for comprehensive refund management
                if (!Schema::hasColumn('refunds', 'method')) {
                    $table->string('method')->default('credit_note')->after('refund_status');
                }
                
                if (!Schema::hasColumn('refunds', 'reference')) {
                    $table->string('reference')->nullable()->after('method');
                }
                
                if (!Schema::hasColumn('refunds', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('completed_at');
                }
                
                // Add fields for better tracking
                if (!Schema::hasColumn('refunds', 'credit_note_id')) {
                    $table->foreignId('credit_note_id')->nullable()->after('vendor_id')->constrained('credit_notes')->nullOnDelete();
                }
                
                if (!Schema::hasColumn('refunds', 'sale_id')) {
                    $table->foreignId('sale_id')->nullable()->after('order_id')->constrained('sales')->nullOnDelete();
                }
                
                if (!Schema::hasColumn('refunds', 'sale_return_id')) {
                    $table->foreignId('sale_return_id')->nullable()->after('sale_id')->constrained('sale_returns')->nullOnDelete();
                }
            });
        }

        // Add vendor support to refund items table
        if (Schema::hasTable('refund_items')) {
            Schema::table('refund_items', function (Blueprint $table) {
                if (!Schema::hasColumn('refund_items', 'vendor_id')) {
                    $table->foreignId('vendor_id')->nullable()->after('refund_id')->constrained('vendors')->nullOnDelete();
                    $table->index('vendor_id');
                }
            });
        }

        // Add vendor support to credit notes table
        if (Schema::hasTable('credit_notes')) {
            Schema::table('credit_notes', function (Blueprint $table) {
                if (!Schema::hasColumn('credit_notes', 'vendor_id')) {
                    $table->foreignId('vendor_id')->nullable()->after('customer_id')->constrained('vendors')->nullOnDelete();
                    $table->index('vendor_id');
                }
            });
        }

        // Add missing fields to sales table for refund tracking
        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                if (!Schema::hasColumn('sales', 'refunded_amount')) {
                    $table->decimal('refunded_amount', 12, 2)->default(0)->after('total');
                }
                
                if (!Schema::hasColumn('sales', 'refund_status')) {
                    $table->enum('refund_status', ['none', 'partial', 'full'])->default('none')->after('refunded_amount');
                }
                
                if (!Schema::hasColumn('sales', 'last_refund_at')) {
                    $table->timestamp('last_refund_at')->nullable()->after('refund_status');
                }
            });
        }

        // Update the original refunds table structure to match current expectations
        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                // Make order_id nullable since we now support both orders and sales
                if (Schema::hasColumn('refunds', 'order_id')) {
                    $table->foreignId('order_id')->nullable()->change();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->dropColumn(['refunded_amount', 'refund_status', 'last_refund_at']);
            });
        }

        if (Schema::hasTable('credit_notes')) {
            Schema::table('credit_notes', function (Blueprint $table) {
                if (Schema::hasColumn('credit_notes', 'vendor_id')) {
                    $table->dropForeign(['vendor_id']);
                    $table->dropIndex(['vendor_id']);
                    $table->dropColumn('vendor_id');
                }
            });
        }

        if (Schema::hasTable('refund_items')) {
            Schema::table('refund_items', function (Blueprint $table) {
                if (Schema::hasColumn('refund_items', 'vendor_id')) {
                    $table->dropForeign(['vendor_id']);
                    $table->dropIndex(['vendor_id']);
                    $table->dropColumn('vendor_id');
                }
            });
        }

        if (Schema::hasTable('refunds')) {
            Schema::table('refunds', function (Blueprint $table) {
                $columns = ['vendor_id', 'credit_note_id', 'sale_id', 'sale_return_id', 'method', 'reference', 'paid_at'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('refunds', $column)) {
                        if (in_array($column, ['vendor_id', 'credit_note_id', 'sale_id', 'sale_return_id'])) {
                            $table->dropForeign([$column]);
                        }
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};