<?php

return [
    'polling' => [
        'initial_delay'    => env('DATAFORSEO_INITIAL_DELAY', 3),
        'subsequent_delay' => env('DATAFORSEO_SUBSEQUENT_DELAY', 10),
        'max_retries'      => env('DATAFORSEO_MAX_RETRIES', 30),
        'backoff_factor'   => env('DATAFORSEO_BACKOFF_FACTOR', 2), // new
    ],
];
