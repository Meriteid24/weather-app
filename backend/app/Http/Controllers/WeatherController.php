<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class WeatherController extends Controller
{
    const MAX_FORECAST_DAYS = 3;

    public function getWeather(Request $request)
    {
        $city = $request->query('city');

        if (!$city || trim($city) === '') {
            return response()->json(['error' => 'City name is required'], 400);
        }

        $apiKey = env('OPENWEATHERMAP_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'API key not configured'], 500);
        }

        try {
            // 1️⃣ Get geocode
            $geoResponse = Http::get("https://api.openweathermap.org/geo/1.0/direct", [
                'q' => $city,
                'limit' => 1,
                'appid' => $apiKey
            ])->json();

            if (empty($geoResponse)) {
                return response()->json(['error' => "Location '{$city}' not found"], 404);
            }

            $location = $geoResponse[0];
            $lat = $location['lat'];
            $lon = $location['lon'];
            $cityName = $location['name'];
            $country = $location['country'];

            // 2️⃣ Get current weather
            $current = Http::get("https://api.openweathermap.org/data/2.5/weather", [
                'lat' => $lat,
                'lon' => $lon,
                'units' => 'metric',
                'appid' => $apiKey
            ])->json();

            // 3️⃣ Get forecast
            $forecastResponse = Http::get("https://api.openweathermap.org/data/2.5/forecast", [
                'lat' => $lat,
                'lon' => $lon,
                'units' => 'metric',
                'appid' => $apiKey
            ])->json();

            $forecastDays = $this->processForecastData($forecastResponse['list']);

            return response()->json($this->transformWeatherData($cityName, $country, $current, $forecastDays));

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function processForecastData(array $items)
    {
        $days = [];
        foreach ($items as $item) {
            $dateKey = Carbon::createFromTimestamp($item['dt'])->format('Y-m-d');

            if (!isset($days[$dateKey])) {
                $days[$dateKey] = [
                    'date' => Carbon::createFromTimestamp($item['dt'])->toIso8601String(),
                    'day' => Carbon::createFromTimestamp($item['dt'])->format('l'),
                    'minTemp' => $item['main']['temp_min'],
                    'maxTemp' => $item['main']['temp_max'],
                    'icon' => $item['weather'][0]['icon'],
                    'description' => $item['weather'][0]['description'],
                ];
            } else {
                $days[$dateKey]['minTemp'] = min($days[$dateKey]['minTemp'], $item['main']['temp_min']);
                $days[$dateKey]['maxTemp'] = max($days[$dateKey]['maxTemp'], $item['main']['temp_max']);
            }

            if (count($days) >= self::MAX_FORECAST_DAYS) break;
        }

        $days = array_values($days);

        // Fill missing days if needed
        while (count($days) < self::MAX_FORECAST_DAYS) {
            $lastDay = end($days);
            $newDate = Carbon::parse($lastDay['date'])->addDay();
            $days[] = [
                ...$lastDay,
                'date' => $newDate->toIso8601String(),
                'day' => $newDate->format('l')
            ];
        }

        return array_slice($days, 0, self::MAX_FORECAST_DAYS);
    }

    private function transformWeatherData($city, $country, $current, $forecast)
    {
        return [
            'city' => $city,
            'country' => $country,
            'date' => Carbon::createFromTimestamp($current['dt'])->format('F j, Y g:i A'),
            'humidity' => $current['main']['humidity'],
            'windSpeed' => $current['wind']['speed'],
            'windDirection' => $this->degToCompass($current['wind']['deg']),
            'current' => [
                'temp' => $current['main']['temp'],
                'feels_like' => $current['main']['feels_like'],
                'description' => $current['weather'][0]['description'],
                'icon' => $current['weather'][0]['icon'],
            ],
            'forecast' => $forecast
        ];
    }

    private function degToCompass($deg)
    {
        $directions = ['N','NE','E','SE','S','SW','W','NW'];
        return $directions[round(($deg % 360) / 45) % 8];
    }
}
