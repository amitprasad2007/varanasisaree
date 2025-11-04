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
        Schema::table('posts', function (Blueprint $table) {
            $table->text('excerpt')->nullable()->after('content');
            $table->string('featured_image')->nullable()->after('excerpt');
            $table->string('fallback_image')->nullable()->after('featured_image');
            $table->string('author_name')->nullable()->after('customer_id');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->boolean('is_featured')->default(false)->after('published_at');
            $table->unsignedBigInteger('views_count')->default(0)->after('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn([
                'excerpt',
                'featured_image',
                'fallback_image',
                'author_name',
                'published_at',
                'is_featured',
                'views_count'
            ]);
        });
    }
};
