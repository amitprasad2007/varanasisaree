<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_returns', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_returns', 'status')) {
                $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed')->after('refund_total');
            }
            if (!Schema::hasColumn('sale_returns', 'return_date')) {
                $table->date('return_date')->nullable()->after('status');
            }
            if (!Schema::hasColumn('sale_returns', 'return_details')) {
                $table->text('return_details')->nullable()->after('return_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sale_returns', function (Blueprint $table) {
            if (Schema::hasColumn('sale_returns', 'return_details')) {
                $table->dropColumn('return_details');
            }
            if (Schema::hasColumn('sale_returns', 'return_date')) {
                $table->dropColumn('return_date');
            }
            if (Schema::hasColumn('sale_returns', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
