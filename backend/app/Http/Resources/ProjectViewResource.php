<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectViewResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        $project = $this->resource;

        return [
            'id' => $project->id,
            'name' => $project->name,
            'url' => $project->url,
            'created_at' => $project->created_at,
            'location_code' => $project->location_code,
            'location_name' => $project->location_name,
            'country' => $project->country,
            'keywords_count' => $project->keywords_count,
            'backlinks_count' => $project->backlink_urls_count,
        ];
    }
}
