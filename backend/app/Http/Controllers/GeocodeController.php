<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GeocodeController extends Controller
{
    public function getGeocode(Request $request)
    {
        $city = $request->query('city');

        if (!$city) {
            return response()->json(['error' => 'City parameter is required'], 400);
        }

        // Example: hardcoded coordinates for Nairobi
        return response()->json([
            'lat' => -1.2921,
            'lon' => 36.8219,
            'city' => $city
        ]);
    }
}
