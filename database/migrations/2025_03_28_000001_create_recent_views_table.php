<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recent_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamp('viewed_at')->index();
            $table->timestamps();
            $table->unique(['customer_id', 'product_id']);
            $table->index(['customer_id', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recent_views');
    }
};


