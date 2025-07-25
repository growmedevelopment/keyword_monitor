<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeywordRank extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'raw' => 'array',
        'tracked_at' => 'date',
    ];

    public function keyword()
    {
        return $this->belongsTo(Keyword::class);
    }
}
