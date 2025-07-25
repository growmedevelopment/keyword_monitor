<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataForSeoResult extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function task(): BelongsTo {
        return $this->belongsTo(DataForSeoTask::class, 'data_for_seo_task_id');
    }

    public function keyword(): BelongsTo {
        return $this->belongsTo(Keyword::class);
    }
}
