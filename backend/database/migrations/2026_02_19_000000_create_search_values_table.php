<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('search_values', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('keyword_id')->unique()->constrained()->onDelete('cascade');
            $table->bigInteger('search_volume')->nullable();
            $table->decimal('cpc', 10, 2)->nullable();
            $table->string('competition')->nullable();
            $table->integer('competition_index')->nullable();
            $table->decimal('low_top_of_page_bid', 10, 2)->nullable();
            $table->decimal('high_top_of_page_bid', 10, 2)->nullable();
            $table->boolean('search_partners')->default(false);
            $table->string('currency')->default('USD');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_values');
    }
};
