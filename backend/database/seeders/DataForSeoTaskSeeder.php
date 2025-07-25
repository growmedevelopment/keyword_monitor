<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Keyword;
use App\Models\DataForSeoTask;
use Carbon\Carbon;

class DataForSeoTaskSeeder extends Seeder
{
    public function run(): void
    {
        $keywords = Keyword::all();

        foreach ($keywords as $keyword) {
            for ($monthOffset = 0; $monthOffset < 9; $monthOffset++) {
                $monthStart = Carbon::now()->subMonths($monthOffset)->startOfMonth();
                $daysInMonth = $monthStart->daysInMonth;

                $days = range(0, min(29, $daysInMonth - 1));
                shuffle($days);

                foreach (array_slice($days, 0, 30) as $day) {
                    $date = $monthStart->copy()->addDays($day);

                    DataForSeoTask::factory()->create([
                        'keyword_id' => $keyword->id,
                        'project_id' => $keyword->project_id,
                        'submitted_at' => $date,
                        'completed_at' => $date,
                    ]);
                }
            }
        }
    }
}
