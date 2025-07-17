<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SerpLocationService
{
    protected string $apiUrl = 'https://api.dataforseo.com/v3/serp/google/locations';

    /**
     * @throws \Illuminate\Http\Client\ConnectionException
     * @throws \Exception
     */
    public function fetchLocations(): array
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        $response = Http::withBasicAuth($username, $password)
            ->get($this->apiUrl);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception('Failed to fetch locations from external API');
    }
}
