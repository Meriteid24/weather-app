<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => [
        'api/*', 
        'geocode',
        'weather',
        'sanctum/csrf-cookie' // Add this if using Sanctum for authentication
    ],

    'allowed_methods' => [
        'GET',
        'POST',
        'OPTIONS', // Important for preflight requests
    ],

    'allowed_origins' => [
        'https://weather-jywk8mzu8-meriteid24s-projects.vercel.app',
        'https://*.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8000' // Add if testing from local Laravel server
    ],

    'allowed_origins_patterns' => [
        // You can use regex patterns here if needed
    ],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ],

    'exposed_headers' => [
        'Authorization',
        'X-Custom-Header'
    ],

    'max_age' => 86400, // 24 hours (preflight cache)

    'supports_credentials' => false, // Set to true if using cookies/auth
];