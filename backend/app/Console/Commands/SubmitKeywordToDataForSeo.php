<?php

namespace App\Console\Commands;

use App\Enums\DataForSeoTaskStatus;
use App\Services\DataForSeo\CredentialsService;
use Illuminate\Console\Command;
use App\Models\Keyword;
use App\Models\DataForSeoTask;
use Illuminate\Support\Facades\Http;

class SubmitKeywordToDataForSeo extends Command
{
    protected $signature = 'keywords:submit';
    protected $description = 'Submit keywords to DataForSEO API';

    /**
     * @throws \Illuminate\Http\Client\ConnectionException
     */
    public function handle(): void {
        $keywords = Keyword::whereDoesntHave('dataForSeoTasks')->get();
        ['username' => $username, 'password' => $password] = CredentialsService::get();

        if (!$username || !$password) {
            $this->error('Missing DataForSEO credentials in config/services.php or .env');
            return;
        }

        foreach ($keywords as $keyword) {
            $payload = [[
                "keyword" => mb_convert_encoding($keyword->keyword, "UTF-8"),
                "location_code" => 1001801, //Calgary
                "language_code" => "en",
                "priority" => 1,
                "tag" => "keyword_{$keyword->id}",
            ]];

            $response = Http::withBasicAuth($username, $password)
                ->post('https://api.dataforseo.com/v3/serp/google/organic/task_post', $payload);

            if ($response->successful()) {
                $taskData = $response->json()['tasks'][0] ?? null;

                if ($taskData && isset($taskData['id'])) {
                    DataForSeoTask::create([
                        'keyword_id'   => $keyword->id,
                        'project_id'   => $keyword->project_id,
                        'task_id'      => $taskData['id'],
                        'status'       => DataForSeoTaskStatus::SUBMITTED,
                        'cost'         => $taskData['cost'] ?? 0,
                        'submitted_at' => now(),
                        'raw_response' => $taskData,
                    ]);

                    $this->info("✅ Submitted keyword: {$keyword->keyword}");
                } else {
                    $this->error("❌ API response structure invalid for keyword: {$keyword->keyword}");
                    dump($response->json());
                }
            } else {
                $this->error("❌ Failed to submit keyword: {$keyword->keyword}");
                dump($response->json());
            }

            usleep(200000); // Optional: 200ms delay between requests to be polite to API
        }
    }
}
