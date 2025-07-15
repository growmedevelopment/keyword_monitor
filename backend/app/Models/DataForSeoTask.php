<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataForSeoTask extends Model
{
    protected $fillable = [
        'keyword_id',
        'project_id',
        'task_id',
        'cost',
        'status',
        'type',
        'result_count',
        'result_url',
        'submitted_at',
        'completed_at',
        'raw_response',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
        'raw_response' => 'array',
    ];

    public function keyword(): BelongsTo {
        return $this->belongsTo(Keyword::class);
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }
}
