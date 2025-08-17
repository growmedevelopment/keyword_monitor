<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('keywords', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('keyword');
            $table->string('tracking_priority')->default('1');
            $table->string('location')->nullable();
            $table->string('language')->default('en');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_submitted_at')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'keyword', 'location', 'language']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keywords');
    }
};
