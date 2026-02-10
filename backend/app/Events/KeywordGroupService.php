<?php

namespace App\Events;

use App\Models\Keyword;
use App\Models\KeywordGroup;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class KeywordGroupService
{
    public function getAllGroups(): Collection {
        return KeywordGroup::all();
    }

    public function createGroup(array $data)
    {
        return DB::transaction(static function () use ($data) {
            $project = Project::findOrFail($data['project_id']);

            return $project->keyword_groups()->firstOrCreate(
                ['name' => $data['name']],
                ['color' => $data['color']]
            );
        });
    }

    public function deleteGroup(int $id): void
    {
        $group = KeywordGroup::findOrFail($id);

        // Detach keywords
        $group->keywords()->detach();

        $group->delete();
    }

    public function getProjectGroups(int $project_id)
    {
        return KeywordGroup::where('project_id', $project_id)->get();
    }

    public function setKeywordGroup(array $data): void
    {
        $keyword = Keyword::findOrFail($data['keyword_id']);
        $keyword->keyword_groups()->sync($data['keyword_groups_id']);
    }

    public function unsetKeywordGroup(int $keywordId, int $keywordGroupId): void
    {
        $keyword = Keyword::findOrFail($keywordId);
        $keyword->keyword_groups()->detach($keywordGroupId);
    }
}
