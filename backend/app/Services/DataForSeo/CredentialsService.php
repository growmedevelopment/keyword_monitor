<?php

namespace App\Services\DataForSeo;

class CredentialsService
{
    public static function get(): array
    {
        $username = config('services.dataforseo.username');
        $password = config('services.dataforseo.password');

        if (!$username || !$password) {
            throw new \RuntimeException('Missing DataForSEO credentials.');
        }

        return compact('username', 'password');
    }
}
