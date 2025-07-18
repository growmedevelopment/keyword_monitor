<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataForSeoResult extends Model
{
    protected $guarded = [];


    public function keyword(): BelongsTo {
        return $this->belongsTo(Keyword::class);
    }
}
