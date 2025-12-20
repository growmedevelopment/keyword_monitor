<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDetailedViewResource extends JsonResource
{
    private string $mode;

    public function __construct($resource, string $mode = 'range')
    {
        parent::__construct($resource);
        $this->mode = $mode;
    }

    public function toArray(Request $request): array
    {
        $project = $this->resource;

        return [
            'id' => $project->id,
            'name' => $project->name,
            'url' => $project->url,
            'user' => [
                'id' => $project->user->id,
                'name' => $project->user->name,
                'email' => $project->user->email,
            ],
            'keywords' => ProjectKeywordResource::collection($this->whenLoaded('keywords')),
            'keyword_groups' => ProjectKeywordGroupResource::collection($this->whenLoaded('keyword_groups')),
            'mode' => $this->mode,
            'created_at' => $project->created_at,
            'location_code' => $project->location_code,
            'location_name' => $project->location_name,
            'country' => $project->country,
            'keywords_count' => $project->keywords_count,
            'backlinks_count' => $project->backlink_urls_count,
        ];
    }
}

