<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KeywordGroup extends Model
{
    protected $fillable = ['name', 'color'];

    public function keywords(): HasMany {
        return $this->hasMany(Keyword::class);
    }
}
