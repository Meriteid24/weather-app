import React, { useState, useEffect } from "react";
import { WeatherData, TemperatureUnit } from "@/types/weather";
import { fetchWeatherByCity, convertTemperature } from "@/services/weatherService";
import SearchBar from "./SearchBar";
import CurrentWeather from "./CurrentWeather";
import ForecastSection from "./ForecastSection";
import WeatherDetails from "./WeatherDetails";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>("Nairobi");
  const [unit, setUnit] = useState<TemperatureUnit>("C");
  const { toast } = useToast();

  // Fetch weather data when city changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherByCity(city);
        
        // Ensure we have exactly 3 forecast days
        if (data.forecast && Array.isArray(data.forecast)) {
          if (data.forecast.length < 3) {
            console.warn('Not enough forecast days provided by the API, data might be incomplete');
          }
          
          // Take exactly 3 days
          data.forecast = data.forecast.slice(0, 3);
        }
        
        setWeatherData(data);
      } catch (err) {
        setError("Unable to fetch weather data. Please check your connection and try again.");
        toast({
          title: "Connection Error",
          description: "Failed to connect to weather service. Please try again later.",
          variant: "destructive"
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, toast]);

  // Handle search submission
  const handleSearch = (searchCity: string) => {
    if (searchCity.trim() !== "") {
      setCity(searchCity);
    }
  };

  // Toggle temperature unit
  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  // Convert displayed temperatures based on selected unit
  const displayTemp = (temp: number): number => {
    return unit === "C" ? temp : convertTemperature(temp, "F");
  };

  // Handle refresh
  const handleRefresh = () => {
    if (city.trim() !== "") {
      setCity(prevCity => prevCity); // Trigger a refetch with the same city
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            {/* Search Bar */}
            <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-700/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <SearchBar onSearch={handleSearch} />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleRefresh}
                      className="flex items-center justify-center h-10 w-12 rounded-md border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
                      aria-label="Refresh weather data"
                      variant="outline"
                    >
                      <RefreshCw size={18} />
                    </Button>
                    <button 
                      onClick={toggleUnit}
                      className="flex items-center justify-center h-10 w-12 rounded-md border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
                      aria-label="Toggle temperature unit"
                    >
                      °{unit}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-weather-blue mb-4"></div>
                <p className="text-gray-500">Loading weather data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <CloudOff size={48} className="text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Connection Error</h3>
                <p className="text-gray-600 dark:text-gray-300">{error}</p>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  className="mt-4"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
              </div>
            ) : weatherData ? (
              <>
                {/* Current Weather */}
                <CurrentWeather 
                  data={weatherData} 
                  unit={unit} 
                  displayTemp={displayTemp} 
                />

                {/* Forecast */}
                <ForecastSection 
                  forecast={weatherData.forecast} 
                  unit={unit} 
                  displayTemp={displayTemp} 
                />

                {/* Weather Details */}
                <WeatherDetails 
                  windSpeed={weatherData.windSpeed} 
                  humidity={weatherData.humidity} 
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <p className="text-gray-500">Enter a city to get weather information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
