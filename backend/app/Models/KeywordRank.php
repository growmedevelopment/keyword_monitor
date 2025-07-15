<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KeywordRank extends Model
{
    protected $fillable = [
        'keyword_id',
        'position',
        'url',
        'ranked_at',
        'snapshot',
    ];

    protected $casts = [
        'ranked_at' => 'datetime',
        'snapshot' => 'array',
    ];

    public function keyword()
    {
        return $this->belongsTo(Keyword::class);
    }
}
