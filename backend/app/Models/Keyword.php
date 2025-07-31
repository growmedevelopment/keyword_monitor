<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Keyword extends Model
{
    use HasFactory;

    protected $guarded = [];


    public function dataForSeoTasks(): HasMany {
        return $this->hasMany(DataForSeoTask::class);
    }

    public function dataForSeoResults(): HasManyThrough|Keyword {
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

    public function lowestDataForSeoResults(): HasOneThrough|Keyword {
        return $this->hasOneThrough(
            DataForSeoResult::class,
            DataForSeoTask::class,
            'keyword_id',            // Foreign key on data_for_seo_tasks table
            'data_for_seo_task_id',  // Foreign key on data_for_seo_results table
            'id',                    // Local key on keywords table
            'id'                     // Local key on data_for_seo_tasks table
        )->orderBy('rank_absolute', 'asc');
    }
}
