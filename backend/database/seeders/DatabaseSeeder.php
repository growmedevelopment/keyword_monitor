<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        // Run other seeders
        $this->call([
            UserSeeder::class,
            ProjectSeeder::class,
            KeywordSeeder::class,
            DataForSeoTaskSeeder::class,
            DataForSeoResultSeeder::class,
            KeywordRankSeeder::class,
        ]);
    }
}
