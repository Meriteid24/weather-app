<?php
return [
    'paths' => ['api/*', 'geocode', 'weather'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://weather-jywk8mzu8-meriteid24s-projects.vercel.app',
        'https://*.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
