<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('keyword_ranks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keyword_id')->constrained()->onDelete('cascade');
            $table->integer('position')->nullable(); // e.g., 3rd place in Google
            $table->string('url')->nullable();       // URL that ranked
            $table->json('raw')->nullable();         // full raw API response
            $table->date('tracked_at');              // date of the rank check
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keyword_ranks');
    }
};
