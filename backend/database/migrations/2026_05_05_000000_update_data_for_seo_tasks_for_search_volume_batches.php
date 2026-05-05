<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('data_for_seo_tasks', static function (Blueprint $table) {
            $table->foreignId('keyword_id')->nullable()->change();
            $table->json('batch_keyword_map')->nullable()->after('keyword_id');
        });
    }

    public function down(): void
    {
        Schema::table('data_for_seo_tasks', static function (Blueprint $table) {
            $table->dropColumn('batch_keyword_map');
            $table->foreignId('keyword_id')->nullable(false)->change();
        });
    }
};
