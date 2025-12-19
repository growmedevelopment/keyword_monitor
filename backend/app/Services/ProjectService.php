<?php

namespace App\Services;

use App\Http\Resources\ProjectsResource;
use App\Http\Resources\ProjectViewResource;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
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
        $mode = $request->input('mode', 'range');

        $startDate = $request->input('date_range.start_date');
        $endDate   = $request->input('date_range.end_date');

        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $project = Project::with([
            'keyword_groups',
            'keywords',
            'keywords.keywordsRank' => function ($q) use ($mode, $start, $end, $startDate, $endDate) {

                if ($mode === 'range') {
                    $q->whereBetween('tracked_at', [$start, $end]);
                }

                if ($mode === 'compare') {
                    $q->where(function ($query) use ($startDate, $endDate) {
                        $query->whereDate('tracked_at', '=', $startDate)
                            ->orWhereDate('tracked_at', '=', $endDate);
                    });
                }

                $q->orderBy('tracked_at', 'desc');
            }
        ])
            ->withCount(['keywords', 'backlink_urls'])
            ->findOrFail($id);

        if ($project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return new ProjectViewResource($project, $mode);
    }
}
