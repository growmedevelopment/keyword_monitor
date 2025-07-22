<?php

namespace App\Services;

use App\Models\Keyword;
use App\Models\DataForSeoTask;
use App\Models\Project;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KeywordSubmissionService
{
    public function submitUnprocessedKeywords(Project $project, string $new_keyword): void
    {

        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        if (!$username || !$password) {
            throw new \Exception('Missing DataForSEO credentials.');
        }

        dd($project);
//
//        foreach ($keywords as $keyword) {
//            $payload = [[
//                'keyword'        => mb_convert_encoding($keyword->keyword, 'UTF-8'),
//                'location_code'  => 1001801,
//                'language_code'  => 'en',
//                'priority'       => 1,
//                'tag'            => "keyword_{$keyword->id}",
//            ]];
//
//            try {
//                $response = Http::withBasicAuth($username, $password)
//                    ->post('https://api.dataforseo.com/v3/serp/google/organic/task_post', $payload);
//
//                $json = $response->json();
//
//                if ($response->successful() && isset($json['tasks'][0]['id'])) {
//                    $task = $json['tasks'][0];
//
//                    DataForSeoTask::create([
//                        'keyword_id'   => $keyword->id,
//                        'project_id'   => $keyword->project_id,
//                        'task_id'      => $task['id'],
//                        'status'       => 'Submitted',
//                        'cost'         => $task['cost'] ?? 0,
//                        'submitted_at' => now(),
//                        'raw_response' => $task,
//                    ]);
//                } else {
//                    Log::warning('Invalid DataForSEO response.', ['keyword' => $keyword->keyword, 'response' => $json]);
//                }
//            } catch (\Throwable $e) {
//                Log::error('Failed to submit keyword', [
//                    'keyword' => $keyword->keyword,
//                    'message' => $e->getMessage(),
//                ]);
//            }
//
//            usleep(200000); // 200ms delay
//        }
    }
}
