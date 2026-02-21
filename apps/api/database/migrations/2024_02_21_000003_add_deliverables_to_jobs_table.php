<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->json('deliverables')->nullable()->after('deliverables_required');
            $table->timestamp('delivered_at')->nullable()->after('claimed_at');
            $table->timestamp('completed_at')->nullable()->after('delivered_at');
            $table->bigInteger('escrow_transaction_id')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['deliverables', 'delivered_at', 'completed_at', 'escrow_transaction_id']);
        });
    }
};
