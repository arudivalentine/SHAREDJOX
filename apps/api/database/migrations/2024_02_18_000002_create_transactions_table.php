<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['deposit', 'withdraw']);
            $table->decimal('amount', 15, 2);
            $table->string('reference');
            $table->enum('status', ['pending', 'completed', 'cancelled', 'failed'])->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['wallet_id', 'status']);
            $table->index(['wallet_id', 'created_at']);
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
