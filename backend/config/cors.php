<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'geocode', 'weather'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // For development, restrict in production
    'allowed_origins_patterns' => [
        'https://weather-.*\.vercel\.app',
        'https://weather-app-.*\.vercel\.app'
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];

