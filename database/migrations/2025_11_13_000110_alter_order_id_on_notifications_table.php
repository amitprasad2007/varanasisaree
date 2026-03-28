<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::connection($this->getConnection())->getDriverName() !== 'sqlite') {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropForeign(['order_id']);
            });

            DB::statement('ALTER TABLE notifications MODIFY order_id VARCHAR(255) NULL');
        } else {
            Schema::table('notifications', function (Blueprint $table) {
                $table->string('order_id')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection($this->getConnection())->getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE notifications MODIFY order_id BIGINT UNSIGNED NULL');

            Schema::table('notifications', function (Blueprint $table) {
                $table->foreign('order_id')
                    ->references('id')
                    ->on('orders')
                    ->cascadeOnDelete();
            });
        } else {
            Schema::table('notifications', function (Blueprint $table) {
                $table->unsignedBigInteger('order_id')->nullable()->change();
            });
        }
    }
};
