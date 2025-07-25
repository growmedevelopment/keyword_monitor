<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        Project::factory(3)->create([
            'user_id' => $users[0]->id
        ]);

        Project::factory(2)->create([
            'user_id' => $users[1]->id
        ]);
    }
}
