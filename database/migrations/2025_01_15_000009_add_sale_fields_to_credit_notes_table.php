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
        Schema::table('credit_notes', function (Blueprint $table) {
            $table->foreignId('sale_id')->nullable()->after('order_id')->constrained('sales')->nullOnDelete();
            $table->foreignId('sale_return_id')->nullable()->after('sale_id')->constrained('sale_returns')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credit_notes', function (Blueprint $table) {
            $table->dropForeign(['sale_id']);
            $table->dropForeign(['sale_return_id']);
            $table->dropColumn(['sale_id', 'sale_return_id']);
        });
    }
};

