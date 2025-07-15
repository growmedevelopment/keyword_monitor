<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;
use App\Models\DataForSeoTask;
use App\Models\DataForSeoResult;
use Illuminate\Support\Facades\Http;

class FetchKeywordResults extends Command
{
    protected $signature = 'keywords:fetch';
    protected $description = 'Fetch results from DataForSEO API';

    public function handle(): void
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        $tasks = DataForSeoTask::where('status', 'Submitted')->get();



        foreach ($tasks as $task) {
            $project = $task->project;
            $project_url = $project->url;

            $response = Http::withBasicAuth($username, $password)
                ->get("https://api.dataforseo.com/v3/serp/google/organic/task_get/regular/{$task->task_id}");

            if (!$response->successful()) {
                $this->error("❌ Failed to fetch for task: {$task->task_id}");
                continue;
            }

            $data = $response->json();
            $taskData = $data['tasks'][0] ?? null;
            $results = $taskData['result'][0]['items'] ?? [];
            $bestRanked = collect($results)
                ->filter(fn($item) => isset($item['url'], $item['rank_absolute']) && str_contains($item['url'], $project_url))
                ->sortBy('rank_absolute')
                ->first();

            if (!empty($bestRanked)) {
                DataForSeoResult::create([
                    'data_for_seo_task_id' => $task->id,
                    'type' => $bestRanked['type'],
                    'rank_group'=> $bestRanked['rank_group'],
                    'rank_absolute' => $bestRanked['rank_absolute'],
                    'domain' => $bestRanked['domain'],
                    'title' => $bestRanked['title'],
                    'description' => $bestRanked['description'],
                    'url' => $bestRanked['url'],
                    'breadcrumb' => $bestRanked['breadcrumb'],
                ]);

                $task->update(['status' => 'Completed']);
                $this->info("✅ Results fetched for: {$task->task_id}");
            } else {
                $this->warn("⚠️ No results yet for: {$task->task_id}");
            }

            // Optional: Avoid rate limiting
            sleep(1);
        }
    }
}
