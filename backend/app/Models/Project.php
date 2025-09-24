<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $guarded = [];

    public function keywords(): HasMany {
        return $this->hasMany(Keyword::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany {
        return $this->hasMany(DataForSeoTask::class);
    }

    public function keyword_groups(): HasMany {
        return $this->hasMany(KeywordGroup::class);
    }

}
