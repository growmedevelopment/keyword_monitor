<?php

namespace Database\Seeders;

use App\Models\Keyword;
use App\Models\Project;
use Illuminate\Database\Seeder;

class KeywordSeeder extends Seeder
{
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            Keyword::factory(10)->create([
                'project_id' => $project->id
            ]);
        }
    }
}
