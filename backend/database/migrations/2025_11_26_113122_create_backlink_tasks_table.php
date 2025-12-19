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
        Schema::create('backlink_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('backlink_target_id')->constrained()->cascadeOnDelete();
            $table->string('task_id')->index();
            $table->integer('status_code')->nullable();
            $table->string('status_message')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backlink_tasks');
    }
};
