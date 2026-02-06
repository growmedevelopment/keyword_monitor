<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Create the new Pivot Table
        Schema::create('keyword_keyword_group', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('keyword_id')->constrained()->onDelete('cascade');
            $table->foreignId('keyword_group_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['keyword_id', 'keyword_group_id']);
        });

        // 2. DATA MIGRATION: Move old data to the new table
        $existing = DB::table('keywords')
            ->whereNotNull('keyword_group_id')
            ->select('id', 'keyword_group_id')
            ->get();

        foreach ($existing as $row) {
            DB::table('keyword_keyword_group')->insert([
                'keyword_id'       => $row->id,
                'keyword_group_id' => $row->keyword_group_id,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        }

        // 3. Drop the old single-ID column
        Schema::table('keywords', static function (Blueprint $table) {
            $table->dropForeign(['keyword_group_id']);
            $table->dropColumn('keyword_group_id');
        });
    }

    public function down(): void
    {
        Schema::table('keywords', static function (Blueprint $table) {
            $table->foreignId('keyword_group_id')->nullable()->constrained('keyword_groups');
        });
        Schema::dropIfExists('keyword_keyword_group');
    }
};
