<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class KeywordGroup extends Model
{
    protected $fillable = ['name', 'color', 'project_id'];

    public function keywords(): BelongsToMany {
        return $this->belongsToMany(Keyword::class, 'keyword_keyword_group');
    }

    public function project(): BelongsTo {
        return $this->belongsTo(Project::class);
    }
}
