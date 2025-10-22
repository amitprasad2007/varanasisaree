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
        Schema::table('orders', function (Blueprint $table) {
            // Add only the missing columns
            if (!Schema::hasColumn('orders', 'order_priority')) {
                $table->enum('order_priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('tracking_events');
            }
            if (!Schema::hasColumn('orders', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete()->after('order_priority');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'assigned_to')) {
                $table->dropForeign(['assigned_to']);
                $table->dropColumn('assigned_to');
            }
            if (Schema::hasColumn('orders', 'order_priority')) {
                $table->dropColumn('order_priority');
            }
        });
    }
};