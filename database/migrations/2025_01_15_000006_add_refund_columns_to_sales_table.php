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
        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                if (!Schema::hasColumn('sales', 'refunded_amount')) {
                    $table->decimal('refunded_amount', 12, 2)->default(0)->after('paid_total');
                }
                if (!Schema::hasColumn('sales', 'refund_status')) {
                    $table->enum('refund_status', ['none', 'partial', 'full'])->default('none')->after('refunded_amount');
                }
                if (!Schema::hasColumn('sales', 'last_refund_at')) {
                    $table->timestamp('last_refund_at')->nullable()->after('refund_status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['refunded_amount', 'refund_status', 'last_refund_at']);
        });
    }
};
