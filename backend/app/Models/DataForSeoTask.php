<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DataForSeoTask extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function keyword(): BelongsTo {
        return $this->belongsTo(Keyword::class);
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }

    public function result(): HasOne {
        return $this->hasOne(DataForSeoResult::class);
    }
}
