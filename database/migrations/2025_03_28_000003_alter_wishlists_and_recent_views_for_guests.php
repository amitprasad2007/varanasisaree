<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add guest support to wishlists
        Schema::table('wishlists', function (Blueprint $table) {
            if (!Schema::hasColumn('wishlists', 'session_token')) {
                $table->string('session_token', 64)->nullable()->after('customer_id')->index();
            }
            // Allow nullable customer for guest rows (requires doctrine/dbal)
            try {
                $table->foreignId('customer_id')->nullable()->change();
            } catch (\Throwable $e) {
                // If change() not supported, leave as-is to avoid migration failure in environments without dbal
            }
            $table->unique(['session_token', 'product_id']);
        });

        // Add guest support to recent_views
        Schema::table('recent_views', function (Blueprint $table) {
            if (!Schema::hasColumn('recent_views', 'session_token')) {
                $table->string('session_token', 64)->nullable()->after('customer_id')->index();
            }
            try {
                $table->foreignId('customer_id')->nullable()->change();
            } catch (\Throwable $e) {
                // ignore if cannot change
            }
            $table->unique(['session_token', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('wishlists', function (Blueprint $table) {
            if (Schema::hasColumn('wishlists', 'session_token')) {
                $table->dropIndex(['session_token']);
                $table->dropUnique(['session_token', 'product_id']);
                $table->dropColumn('session_token');
            }
        });

        Schema::table('recent_views', function (Blueprint $table) {
            if (Schema::hasColumn('recent_views', 'session_token')) {
                $table->dropIndex(['session_token']);
                $table->dropUnique(['session_token', 'product_id']);
                $table->dropColumn('session_token');
            }
        });
    }
};


