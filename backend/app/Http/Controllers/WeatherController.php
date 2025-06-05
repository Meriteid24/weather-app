<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function getWeather(Request $request)
    {
        // Add your actual weather API logic here
        // For now, let's return a basic response
        return response()->json([
            'status' => 'success',
            'message' => 'Weather endpoint is working',
            'data' => [
                'city' => $request->input('city', 'unknown'),
                'temperature' => 72,
                'conditions' => 'sunny'
            ]
        ]);
    }
}