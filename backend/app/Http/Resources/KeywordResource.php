<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KeywordResource extends JsonResource
{
    public function toArray($request): array
    {

        return [
            'id'=> $this['id'],
            'keyword' => $this['keyword'],
            'status_message' => $this->status_message,
            'status_code' => $this->status_code,
            'results' => DataForSeoResultResource::collection(
                $this->whenLoaded('dataForSeoResults')
            ),
        ];
    }
}
