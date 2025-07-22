<?php

namespace App\Services;

use App\Http\Resources\ProjectsResource;
use App\Http\Resources\ProjectViewResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectService
{

    /**
     * @throws \Exception
     */
    public function getAllByUser(?User $user): AnonymousResourceCollection
    {
        if (!$user) {
            throw new \Exception('Unauthenticated');
        }
        $projects = Project::where('user_id', $user->id)->get();

        return ProjectsResource::collection($projects);

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
            'country' => $data['country'],
            'location_code' => $data['location_code'],
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

    public function show(string $project_id): ProjectViewResource {

        $project = Project::with('keywords.dataForSeoResults')->findOrFail($project_id);

        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return new ProjectViewResource($project);

    }
}
