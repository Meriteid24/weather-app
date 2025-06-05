<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\WeatherController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API Connected!']);
});

// Authentication route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Weather API Routes with CORS middleware
Route::middleware(['cors'])->group(function () {
    // Geocode endpoint
    Route::get('/geocode', [GeocodeController::class, 'getGeocode']);
    
    // Weather endpoint
    Route::get('/weather', [WeatherController::class, 'getWeather']);
    Route::get('/test-http', function () {
    $res = Http::get('https://httpbin.org/get');
    return $res->body();
});

});