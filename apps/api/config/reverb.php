<?php

return [
    'apps' => [
        [
            'key' => env('REVERB_APP_KEY', 'sharedjox'),
            'secret' => env('REVERB_APP_SECRET', 'sharedjox-secret'),
            'allowed_origins' => ['localhost:5173', 'localhost:8000'],
        ],
    ],

    'options' => [
        'host' => env('REVERB_HOST', '0.0.0.0'),
        'port' => env('REVERB_PORT', 8080),
        'scheme' => env('REVERB_SCHEME', 'http'),
    ],

    'database' => env('REVERB_DATABASE', 'redis'),
];
