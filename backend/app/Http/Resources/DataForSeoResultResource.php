<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DataForSeoResultResource extends JsonResource
{
    public function toArray($request): array
    {
        /** @var \App\Models\DataForSeoResult $rank */
        $rank = $this->resource;

        return [
            'type' => $rank->type,
            'rank_group' => $rank->rank_group,
            'rank_absolute' => $rank->rank_absolute,
            'url' => $rank->url,
            'title' => $rank->title,
            'date' => $rank->created_at
        ];
    }
}
