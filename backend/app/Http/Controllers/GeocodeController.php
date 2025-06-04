<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodeController extends Controller
{
    public function getGeocode(Request $request)
    {
        $city = $request->query('city');

        if (!$city) {
            return response()->json(['error' => 'City is required'], 400);
        }

        $response = Http::get("https://api.openweathermap.org/geo/1.0/direct", [
            'q' => $city,
            'limit' => 1,
            'appid' => env('OPENWEATHERMAP_API_KEY')
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to fetch geocode'], 500);
        }

        return response()->json($response->json());
    }
}
