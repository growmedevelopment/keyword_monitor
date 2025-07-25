<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Keyword extends Model
{
    use HasFactory;

    protected $guarded = [];


    public function dataForSeoTasks(): HasMany {
        return $this->hasMany(DataForSeoTask::class);
    }

    public function dataForSeoResults()
    {
        return $this->hasManyThrough(
            DataForSeoResult::class,
            DataForSeoTask::class,
            'keyword_id',              // Foreign key on DataForSeoTask
            'data_for_seo_task_id',   // Foreign key on DataForSeoResult
            'id',                      // Local key on Keyword
            'id'                       // Local key on DataForSeoTask
        );
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }

    public function keywordsRank(): HasMany {
        return $this->hasMany(KeywordRank::class);
    }
}
