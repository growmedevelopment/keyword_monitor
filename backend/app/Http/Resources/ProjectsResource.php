<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectsResource extends JsonResource
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
            'created_at' => $rank->created_at,
        ];
    }
}
