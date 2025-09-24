<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KeywordGroup extends Model
{
    protected $fillable = ['name', 'color', 'project_id'];

    public function keywords(): HasMany {
        return $this->hasMany(Keyword::class);
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }
}
