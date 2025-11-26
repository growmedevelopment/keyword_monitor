<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('backlink_checks', function (Blueprint $table) {
            $table->id();

            // target belongs to backlink_target table
            $table->foreignId('backlink_target_id')
                ->constrained()
                ->cascadeOnDelete();

            // URL checked (canonical page URL returned by SERP)
            $table->string('url', 2048)->nullable();

            // interpreted fields from SERP response
            $table->boolean('indexed')->nullable();     // rank_group > 0
            $table->integer('status_code')->nullable(); // rank_group or http code if needed

            // full raw result JSON
            $table->json('raw')->nullable();

            // timestamp for when the check occurred
            $table->timestamp('checked_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backlink_checks');
    }
};
