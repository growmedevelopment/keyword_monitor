<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Keyword;
use App\Models\KeywordRank;
use App\Models\DataForSeoResult;
use Carbon\Carbon;

class KeywordRankSeeder extends Seeder
{
    public function run(): void
    {
        $keywords = Keyword::all();

        foreach ($keywords as $keyword) {
            $resultUrls = DataForSeoResult::whereHas('task', function ($query) use ($keyword) {
                $query->where('keyword_id', $keyword->id);
            })->pluck('url')->filter()->values();

            if ($resultUrls->isEmpty()) continue;

            for ($monthOffset = 0; $monthOffset < 9; $monthOffset++) {
                $monthStart = Carbon::now()->subMonths($monthOffset)->startOfMonth();
                $daysInMonth = $monthStart->daysInMonth;

                $days = range(0, min(29, $daysInMonth - 1));
                shuffle($days);

                foreach (array_slice($days, 0, 30) as $day) {
                    $date = $monthStart->copy()->addDays($day);

                    KeywordRank::factory()->create([
                        'keyword_id' => $keyword->id,
                        'url' => $resultUrls->random(),
                        'tracked_at' => $date,
                    ]);
                }
            }
        }
    }
}
