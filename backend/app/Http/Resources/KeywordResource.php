<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KeywordResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'keyword' => $this->keyword,
            'status' => optional($this->dataForSeoTasks()->latest()->first())->status ?? 'Queued',
            'results' => DataForSeoResultResource::collection(
                $this->whenLoaded('dataForSeoResults')
            ),
        ];
    }
}
