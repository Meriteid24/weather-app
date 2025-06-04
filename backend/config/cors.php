<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'geocode', 'weather'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        'https://weather-5z0gwj4uw-meriteid24s-projects.vercel.app'
    ],
    'allowed_origins_patterns' => [
        'https://weather-.*\.vercel\.app',
        'https://weather-app-.*\.vercel\.app'
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];