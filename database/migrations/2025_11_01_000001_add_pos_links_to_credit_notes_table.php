<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credit_notes', function (Blueprint $table) {
            if (!Schema::hasColumn('credit_notes', 'sale_id')) {
                $table->foreignId('sale_id')->nullable()->after('order_id')->constrained('sales')->nullOnDelete();
            }
            if (!Schema::hasColumn('credit_notes', 'sale_return_id')) {
                $table->foreignId('sale_return_id')->nullable()->after('sale_id')->constrained('sale_returns')->nullOnDelete();
            }
            if (!Schema::hasColumn('credit_notes', 'reference')) {
                $table->string('reference')->nullable()->after('remaining_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('credit_notes', function (Blueprint $table) {
            if (Schema::hasColumn('credit_notes', 'reference')) {
                $table->dropColumn('reference');
            }
            if (Schema::hasColumn('credit_notes', 'sale_return_id')) {
                $table->dropConstrainedForeignId('sale_return_id');
            }
            if (Schema::hasColumn('credit_notes', 'sale_id')) {
                $table->dropConstrainedForeignId('sale_id');
            }
        });
    }
};
