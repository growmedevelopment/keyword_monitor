<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BacklinkTask extends Model
{
    protected $fillable = [
        'backlink_target_id',
        'task_id',
        'status_code',
        'status_message',
        'raw_response',
        'completed_at',
    ];


    public function target(): BelongsTo
    {
        return $this->belongsTo(BacklinkTarget::class, 'backlink_target_id');
    }
}
