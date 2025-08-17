<?php

namespace App\Services;

use App\Services\DataForSeo\CredentialsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class SerpLocationService
{
    private string $apiUrl = 'https://api.dataforseo.com/v3/serp/google/locations';
    private array $cities = [];

    /**
     * @throws \Illuminate\Http\Client\ConnectionException
     * @throws \Exception
     */
    private function fetchAPI(): array
    {
        ['username' => $username, 'password' => $password] = CredentialsService::get();

        $response = Http::withBasicAuth($username, $password)
            ->get($this->apiUrl);

        if ($response->successful()) {
            return $response->json()['tasks'][0]['result'];
        }

        throw new \RuntimeException('Failed to fetch locations from external API');
    }

    private function getCountries(): JsonResponse {
        return response()->json(
            Cache::rememberForever('countries_list', static function () {
                $json = Storage::get('countries.json');
                return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
            })
        );
    }

    /**
     * @throws \Illuminate\Http\Client\ConnectionException
     */
    private function setCities(): void {

        $api_response = $this->fetchAPI();

        $this->cities = array_filter($api_response, static function ($location) {
            return $location['location_type'] === 'City';
        });
    }

    private function getCities(): array {
        return $this->cities;
    }

    private function filteredCity(string $country_iso_code): array {
        $filtered = array_filter($this->getCities(), static function ($item) use ($country_iso_code) {
            return $item['country_iso_code'] === $country_iso_code;
        });

        return array_map(static function ($item) {
            return [
                'value' => $item['location_code'],
                'label' => explode(',', $item['location_name'])[0],
            ];
        }, $filtered);
    }

    /**
     * @throws \Illuminate\Http\Client\ConnectionException
     */
    public function fetchLocations(Request $request): JsonResponse {

        if ($request->input('request_type') === 'county') {
            return $this->getCountries();
        }

        if ($request->input('request_type') === 'cities') {
            $this->setCities();

            $filteredCity = $this->filteredCity($request->input('country_iso_code'));
            return response()->json(array_values($filteredCity));
        }

        return response()->json([]);
    }



}
