<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KeywordRank extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'raw' => 'array',
        'tracked_at' => 'date',
    ];

    public function keyword(): BelongsTo {
        return $this->belongsTo(Keyword::class);
    }
}
