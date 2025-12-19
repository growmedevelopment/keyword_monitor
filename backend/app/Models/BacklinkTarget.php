<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class BacklinkTarget extends Model
{
    protected $fillable = ['project_id', 'url', 'latest_result_id'];

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }

    public function checks(): HasMany {
        return $this->hasMany(BacklinkCheck::class);
    }

    public function latestResult(): BelongsTo {
        return $this->belongsTo(BacklinkCheck::class, 'latest_result_id');
    }

    public function tasks(): HasMany {
        return $this->hasMany(BacklinkTask::class);
    }
}
