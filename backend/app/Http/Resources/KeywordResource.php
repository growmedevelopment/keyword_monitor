<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KeywordResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'keyword' => $this->keyword,
            'results' => DataForSeoResultResource::collection(
                $this->whenLoaded('dataForSeoResults')
            ),
        ];
    }
}
