<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkCheck extends Model
{
    protected $table = 'backlink_checks';
    protected $guarded = [];

    protected $casts = [
        'indexed'      => 'boolean',
        'raw_response' => 'array',
        'checked_at'   => 'datetime',
    ];

    /**
     * Each check result belongs to a backlink target.
     */
    public function target(): BelongsTo
    {
        return $this->belongsTo(LinkTarget::class, 'backlink_target_id');
    }
}
