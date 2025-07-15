<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Keyword extends Model
{
    protected $guarded = [];


    public function dataForSeoTasks(): HasMany {
        return $this->hasMany(DataForSeoTask::class);
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }
}
