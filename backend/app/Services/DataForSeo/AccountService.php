<?php

namespace App\Services\DataForSeo;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AccountService
{
    public static function getAccountDetails(): array
    {
        $credentials = CredentialsService::get();

        try {
            $response = Http::withBasicAuth($credentials['username'], $credentials['password'])
                ->get('https://api.dataforseo.com/v3/appendix/user_data');

            if ($response->failed()) {
                // Log the error or throw a custom exception
                throw new \RuntimeException('Failed to fetch account details from DataForSEO.');
            }


            $data = $response->json();

            if($data['status_code'] === 20000){
                return $data['tasks'][0]['result'][0];
            }

            return ['status_message' => $data['status_message']];

        } catch (\Throwable $e) {
            // Optional: log the error
            Log::error('DataForSEO API error: ' . $e->getMessage());

            return [
                'error' => 'Unable to retrieve account details.',
            ];
        }
    }
}
