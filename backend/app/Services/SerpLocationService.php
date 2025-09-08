<?php

namespace App\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SerpLocationService
{
    private array $cities = [];

    /**
     * Load locations from local JSON (storage/app/dataforseo/locations.json) and cache them.
     * Supports either a plain array or the DataForSEO envelope (tasks[0].result).
     */
    private function loadLocationsFromFile(): array
    {
        $disk = Storage::disk('local');
        $path = 'locations.json';

        if (!$disk->exists($path)) {
            throw new \RuntimeException("Locations file not found at storage/app/{$path}");
        }

        $data = json_decode(
            $disk->get($path),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        // Safely navigate into the structure
        return $data['tasks'][0]['result'] ?? [];
    }

    private function getCountries(): JsonResponse
    {
        return response()->json(
            Cache::rememberForever('countries_list', static function () {
                $disk = Storage::disk('local');
                $path = 'countries.json';
                if (!$disk->exists($path)) {
                    throw new \RuntimeException("Countries file not found at storage/app/{$path}");
                }
                return json_decode($disk->get($path), true, 512, JSON_THROW_ON_ERROR);
            })
        );
    }

    private function setCities(): void
    {
        $this->cities = Cache::rememberForever('serp_locations_cities', function () {

            $all = $this->loadLocationsFromFile();

            return array_values(array_filter($all, static function ($loc) {
                return ($loc['location_type'] ?? null) === 'City';
            }));
        });
    }

    private function getCities(): array
    {
        return $this->cities;
    }

    private function filteredCity(string $countryIso): array
    {
        // Cache per-country result for speed
        return Cache::rememberForever("serp_locations_cities_{$countryIso}", function () use ($countryIso) {
            $filtered = array_filter($this->getCities(), static function ($item) use ($countryIso) {
                return ($item['country_iso_code'] ?? null) === $countryIso;
            });

            return array_values(array_map(static function ($item) {
                return [
                    'value' => $item['location_code'] ?? null,
                    'label' => explode(',', $item['location_name'] ?? '')[0],
                ];
            }, $filtered));
        });
    }

    public function fetchLocations(Request $request): JsonResponse
    {

        $type = (string) $request->input('request_type');

        if ($type === 'country') {
            return $this->getCountries();
        }

        if ($type === 'cities') {
            $countryIso = (string) $request->input('country_iso_code', '');
            if ($countryIso === '') {
                return response()->json(['message' => 'country_iso_code is required'], 422);
            }

            $this->setCities();

            return response()->json($this->filteredCity($countryIso));
        }

        return response()->json([]);
    }
}
