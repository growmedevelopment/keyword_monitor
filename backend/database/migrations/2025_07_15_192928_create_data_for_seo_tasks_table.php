<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('data_for_seo_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keyword_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('task_id')->unique();              // DataForSEO's unique task ID
            $table->float('cost')->nullable();              // DataForSEO's unique task ID
            $table->string('status')->nullable();
            $table->timestamp('submitted_at')->nullable();    // when the task was submitted
            $table->timestamp('completed_at')->nullable();    // when it finished
            $table->json('raw_response')->nullable();         // full response from DataForSEO
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('data_for_seo_tasks');
    }
};
