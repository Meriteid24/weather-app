<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\WeatherController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/test', function () {
    return response()->json(['message' => 'API Connected!']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Weather API Routes with CORS middleware
Route::middleware(['cors'])->group(function () {
    // Either use controller methods...
    Route::get('/geocode', [GeocodeController::class, 'getGeocode']);
    Route::get('/weather', [WeatherController::class, 'getWeather']);
    
    // OR use inline closures (choose one approach)
    /*
    Route::get('/geocode', function (Request $request) {
        $response = Http::get('http://api.openweathermap.org/geo/1.0/direct', [
            'q' => $request->query('city'),
            'limit' => 1,
            'appid' => config('services.openweather.key')
        ]);
        return $response->json();
    });

    Route::get('/weather', function (Request $request) {
        $current = Http::get('https://api.openweathermap.org/data/2.5/weather', [
            'lat' => $request->query('lat'),
            'lon' => $request->query('lon'),
            'units' => $request->query('units', 'metric'),
            'appid' => config('services.openweather.key')
        ]);

        $forecast = Http::get('https://api.openweathermap.org/data/2.5/forecast', [
            'lat' => $request->query('lat'),
            'lon' => $request->query('lon'),
            'units' => $request->query('units', 'metric'),
            'cnt' => 4,
            'appid' => config('services.openweather.key')
        ]);

        return response()->json([
            'current' => $current->json(),
            'forecast' => $forecast->json()
        ]);
    });
    */
});