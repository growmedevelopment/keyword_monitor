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
            'status' => optional($this->dataForSeoTasks()->latest()->first())->status ?? 'Queued',

            // Rename lowestDataForSeoResults to "results"
            'results' => KeywordRankResultResource::collection(
                $this->whenLoaded('keywordsRank')
            ),
        ];
    }
}
