<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectKeywordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'keyword' => $this->keyword,
            'status_message' => $this->status_message,
            'status_code' => $this->status_code,
            'keyword_group_id' => $this->keyword_groups?->id,
            'keyword_group_name' => $this->keyword_groups?->name,
            'keyword_group_color' => $this->keyword_groups?->color,
            'results' => KeywordRankResultResource::collection(
                $this->whenLoaded('keywordsRank')
            ),
        ];
    }
}
