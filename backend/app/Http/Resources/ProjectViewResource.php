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
        /** @var \App\Models\Project $rank */
        $rank = $this->resource;

        return [
            'id' => $rank->id,
            'name' => $rank->name,
            'url' => $rank->url,
            'user' =>[
                'id' => $rank->user->id,
                'name' => $rank->user->name,
                'email' => $rank->user->email,
            ],
            'keywords' => ProjectKeywordResource::collection($this->whenLoaded('keywords')),
            'created_at' => $rank->created_at,
            'location_code' => $rank->location_code,
            'location_name' => $rank->location_name,
            'country' =>$rank->country,
        ];
    }
}
