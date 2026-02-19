<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchValue extends Model
{

    protected $guarded = [];

    protected $casts = [
        'search_volume' => 'integer',
        'cpc' => 'float',
        'competition_index' => 'integer',
        'low_top_of_page_bid' => 'float',
        'high_top_of_page_bid' => 'float',
        'search_partners' => 'boolean',
    ];

    public function keyword(): BelongsTo
    {
        return $this->belongsTo(Keyword::class);
    }
}
