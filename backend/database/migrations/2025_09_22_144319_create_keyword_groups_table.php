<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKeywordGroupsTable extends Migration
{
    public function up(): void
    {
        Schema::create('keyword_groups', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')
                ->constrained()
                ->onDelete('cascade');
            $table->string('name');
            $table->string('color');
            $table->timestamps();
        });

        Schema::table('keywords', static function (Blueprint $table) {
            $table->foreignId('keyword_group_id')->nullable()->constrained('keyword_groups');
        });



    }

    public function down(): void {
        Schema::table('keywords', static function (Blueprint $table) {
            $table->dropForeign(['keyword_group_id']);
            $table->dropColumn('keyword_group_id');
        });
        Schema::dropIfExists('keyword_groups');
    }
}
