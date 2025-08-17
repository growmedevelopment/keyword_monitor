<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;


class KeywordRankResultResource extends JsonResource
{

    public function toArray($request): array
    {
        /** @var \App\Models\KeywordRank $rank */
        $rank = $this->resource;

        return [
            'rank_group' => $rank->position,
            'url'        => $rank->url,
            'tracked_at' => $rank->tracked_at,
        ];
    }
}
