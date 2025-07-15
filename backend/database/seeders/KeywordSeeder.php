<?php

namespace Database\Seeders;

use App\Models\Keyword;
use App\Models\Project;
use Illuminate\Database\Seeder;

class KeywordSeeder extends Seeder
{
    public function run(): void
    {
        $project = Project::first();

        Keyword::create([
            'project_id' => $project->id,
            'keyword' => 'Laravel SEO',
            'tracking_priority' => 1,
        ]);

        Keyword::create([
            'project_id' => $project->id,
            'keyword' => 'Eloquent ORM',
            'tracking_priority' => 1,
        ]);
    }
}
