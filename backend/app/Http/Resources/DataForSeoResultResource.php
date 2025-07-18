<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DataForSeoResultResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'type' => $this->type,
            'rank_group' => $this->rank_group,
            'rank_absolute' => $this->rank_absolute,
            'url' => $this->url,
            'title' => $this->title,
        ];
    }
}
