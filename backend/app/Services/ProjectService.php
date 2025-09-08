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
            throw new \RuntimeException('Unauthenticated');
        }
        $projects = Project::where('user_id', $user->id)->get();

        return ProjectsResource::collection($projects);

    }

    public function getAllArchivedByUser(User $user): Collection {

        if (!$user) {
            throw new \RuntimeException('Unauthenticated');
        }
        return Project::where('user_id', $user->id)->onlyTrashed()->get();
    }

    public function create(array $data): Project {
        return Project::create([
            'name' => $data['name'],
            'user_id' => Auth::id(),
            'url' => $data['url'],
            'country' => $data['country'],
            'location_code' => $data['location_code'],
            'location_name' => $data['location_name'],
        ]);
    }

    public function update(Project $project, array $data): Project {
        $project->update($data);
        return $project;
    }

    public function delete(int $project_id): void {

        $project = Project::where('user_id', auth()->id())->findOrFail($project_id);

        $project->delete();
    }

    public function show(string $project_id): ProjectViewResource {

        $project = Project::with('keywords.keywordsRank')->findOrFail($project_id);

        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return new ProjectViewResource($project);

    }
}
