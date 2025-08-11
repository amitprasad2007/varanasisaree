<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode')->nullable()->index()->after('slug');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('barcode')->nullable()->index()->after('sku');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('barcode');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('barcode');
        });
    }
};


