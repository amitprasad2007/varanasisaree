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
        Schema::create('vendor_menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('path');
            $table->string('icon')->nullable(); // lucide-react icon name
            $table->unsignedBigInteger('vendor_menu_section_id')->default(1); // Grouping
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_logout')->default(false);
            $table->timestamps();   
            $table->foreign('parent_id')->references('id')->on('vendor_menu_items')->onDelete('cascade');
            $table->foreign('vendor_menu_section_id')->references('id')->on('vendor_menu_sections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_menu_items');
    }
};
