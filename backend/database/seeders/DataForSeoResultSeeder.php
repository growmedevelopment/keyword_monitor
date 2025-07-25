<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Keyword;
use App\Models\DataForSeoTask;
use App\Models\DataForSeoResult;
use Carbon\Carbon;

class DataForSeoResultSeeder extends Seeder
{
    public function run(): void
    {
        $keywords = Keyword::all();

        foreach ($keywords as $keyword) {
            $tasks = DataForSeoTask::where('keyword_id', $keyword->id)->with('project')->get();
            if ($tasks->isEmpty()) continue;

            $projectUrl = $tasks->first()->project->url;

            for ($monthOffset = 0; $monthOffset < 9; $monthOffset++) {
                $monthStart = Carbon::now()->subMonths($monthOffset)->startOfMonth();
                $daysInMonth = $monthStart->daysInMonth;

                $days = range(0, min(29, $daysInMonth - 1));
                shuffle($days);

                foreach (array_slice($days, 0, 30) as $day) {
                    $date = $monthStart->copy()->addDays($day);

                    DataForSeoResult::factory()->create([
                        'data_for_seo_task_id' => $tasks->random()->id,
                        'domain' => $projectUrl,
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }
            }
        }
    }
}
