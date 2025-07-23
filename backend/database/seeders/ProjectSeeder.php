<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first(); // Get the test user we just created

        Project::create([
            'name' => 'Demo Project',
            'user_id' => $user->id,
            'url'=> 'https://laracasts.com',
            'country'=> 'CA',
            'location_code'=> 1001801,
            'location_name'=> 'Calgary',
        ]);
    }
}
