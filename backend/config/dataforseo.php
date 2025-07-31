<?php

return [
    'polling' => [
        'initial_delay'    => env('DATAFORSEO_INITIAL_DELAY', 5),    // seconds
        'subsequent_delay' => env('DATAFORSEO_SUBSEQUENT_DELAY', 30), // seconds
        'max_retries'      => env('DATAFORSEO_MAX_RETRIES', 5),       // attempts
    ],
];
