<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class LinkTarget extends Model
{
    protected $table = 'backlink_targets';
    protected $fillable = ['project_id', 'url', 'latest_result_id', 'type'];

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }

    public function checks(): HasMany {
        return $this->hasMany(LinkCheck::class, 'backlink_target_id');
    }

    public function latestResult(): BelongsTo {
        return $this->belongsTo(LinkCheck::class, 'latest_result_id');
    }

    public function tasks(): HasMany {
        return $this->hasMany(LinkTask::class,'backlink_target_id');
    }
}
