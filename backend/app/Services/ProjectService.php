<?php

namespace App\Services;

use App\Http\Resources\ProjectResource;
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

    public function show(string $project_id): ProjectResource {

        $project = Project::with('keywords.dataForSeoResults')->findOrFail($project_id);

        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return new ProjectResource($project);

    }
}
