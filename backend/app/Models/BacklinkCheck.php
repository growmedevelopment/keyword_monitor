<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BacklinkCheck extends Model
{
    protected $guarded = [];

    protected $casts = [
        'indexed'      => 'boolean',
        'link_found'   => 'boolean',
        'raw_response' => 'array',
        'checked_at'   => 'datetime',
    ];

    /**
     * Each check result belongs to a backlink target.
     */
    public function target(): BelongsTo
    {
        return $this->belongsTo(BacklinkTarget::class, 'backlink_target_id');
    }
}
