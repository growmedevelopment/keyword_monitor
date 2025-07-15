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
        Schema::create('data_for_seo_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('data_for_seo_task_id')->constrained()->onDelete('cascade');
            $table->string('type')->nullable();
            $table->integer('rank_group')->nullable();
            $table->integer('rank_absolute')->nullable();
            $table->string('domain')->nullable();
            $table->text('title')->nullable();
            $table->text('description')->nullable(); // rename from snippet
            $table->string('url')->nullable();
            $table->text('breadcrumb')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_for_seo_results');
    }
};
