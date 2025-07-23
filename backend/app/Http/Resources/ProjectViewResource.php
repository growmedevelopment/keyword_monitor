<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectViewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'user' =>[
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'keywords' => KeywordResource::collection($this->whenLoaded('keywords')),
            'created_at' => $this->created_at,
            'location_code' => $this->location_code,
            'location_name' => $this->location_name,
            'country' =>$this->country,
        ];
    }
}
