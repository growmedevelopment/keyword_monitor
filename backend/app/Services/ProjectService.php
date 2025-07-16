<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ProjectService
{
    public function getAll(): Collection {
        return Project::all();
    }

    public function create(array $data)
    {
        return Project::create([
            'name' => $data['name'],
            'user_id' => Auth::id(),
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

    public function show(Project $project): Project {
        return $project->load(['user', 'keywords', 'tasks']);
    }
}
