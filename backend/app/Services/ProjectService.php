<?php

namespace App\Services;

use App\Http\Resources\ProjectDetailedViewResource;
use App\Http\Resources\ProjectsResource;
use App\Http\Resources\ProjectViewResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
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

    public function restore(int $project_id): void {
        $project = Project::withTrashed()->where('user_id', auth()->id())->findOrFail($project_id);

        $project->restore();
    }

    public function show(Request $request, string $id): ProjectViewResource {

        $project = Project::withCount(['keywords', 'backlinks', 'citations'])->findOrFail($id);

        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return new ProjectViewResource($project);
    }

    public function showDetailed(Request $request, string $id): ProjectDetailedViewResource {

        $mode = $request->input('mode', 'range');

        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        $project = Project::with([
            'keyword_groups',
            'keywords',
            'keywords.keywordsRank' => function ($q) use ($mode,$startDate, $endDate) {

                if ($mode === 'range') {
                    $q->whereBetween('tracked_at', [$startDate, $endDate]);
                }

                if ($mode === 'compare') {
                    $q->where(function ($query) use ($startDate, $endDate) {
                        $query->whereDate('tracked_at', '=', $startDate)
                            ->orWhereDate('tracked_at', '=', $endDate);
                    });
                }

                if ($mode === 'latest') {
                    $q->limit(2);
                }

                $q->orderBy('tracked_at', 'desc');
            },
        ])->findOrFail($id);



        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return new ProjectDetailedViewResource($project, $mode);

    }

    public function getProjectName (int $project_id): string {
        return Project::where('user_id', auth()->id())->findOrFail($project_id)->name;

    }

    /**
     * Update project location details.
     */
    public function updateLocation(int $projectId, array $data): Project
    {
        // Find the project and ensure it belongs to the authenticated user
        $project = Project::where('user_id', auth()->id())->findOrFail($projectId);

        // Update only the location-related fields
        $project->update([
            'country'       => $data['country'],
            'location_code' => $data['location_code'],
            'location_name' => $data['location_name'],
        ]);

        return $project;
    }
}
