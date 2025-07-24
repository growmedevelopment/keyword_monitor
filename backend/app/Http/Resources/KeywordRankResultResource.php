<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;


class KeywordRankResultResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'position' => $this->position,
            'url'      => $this->url,
            'tracked_at'      => $this->tracked_at,
        ];
    }
}
