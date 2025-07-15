<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataForSeoTask extends Model
{
    protected $guarded = [];

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
