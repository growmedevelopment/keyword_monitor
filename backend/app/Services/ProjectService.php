<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ProjectService
{

    /**
     * @throws \Exception
     */
    public function getAllByUser(?User $user): Collection
    {
        if (!$user) {
            throw new \Exception('Unauthenticated');
        }

        return Project::where('user_id', $user->id)->get();
    }

    public function getAll(): Collection {
        return Project::all();
    }

    public function create(array $data)
    {
        return Project::create([
            'name' => $data['name'],
            'user_id' => Auth::id(),
            'url' => $data['url'],
        ]);
    }

    public function update(Project $project, array $data): Project {
        $project->update($data);
        return $project;
    }

    public function delete(Project $project): true {
        $project->delete();
        return true;
    }

    public function show(string $project_id): Project {

        $project = Project::findOrFail($project_id);

        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Hide fields on project
        $project->makeHidden(['id', 'user_id', 'updated_at']);

        // Hide fields on related keywords
        $project->setRelation(
            'keywords',
            $project->keywords->makeHidden(['id', 'project_id', 'created_at', 'updated_at', 'location', 'is_active', 'tracking_priority', 'language'])
        );

        return $project;

    }
}
