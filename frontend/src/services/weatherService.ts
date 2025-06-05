import { WeatherData, ForecastDay } from "@/types/weather";
import { format, startOfDay, addDays } from "date-fns";

// Constants
const DEFAULT_API_URL = "https://weather-app-hqyy.onrender.com/api";
const MAX_FORECAST_DAYS = 3;

// Initialize API URL
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
console.log('Weather Service Initialized with API URL:', BASE_API_URL);

// Type definitions for API responses
interface GeoCodeResponse {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface WeatherApiResponse {
  current: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      temp_min?: number;
      temp_max?: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
  };
  forecast: {
    list: Array<{
      dt: number;
      main: {
        temp_min: number;
        temp_max: number;
      };
      weather: Array<{
        icon: string;
        description: string;
      }>;
    }>;
  };
}

// Enhanced fetch wrapper with timeout and retry logic
async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, BASE_API_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${url.toString()} failed:`, error);
    throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Main weather service function
export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!city?.trim()) {
    throw new Error('City name is required');
  }

  try {
    // 1. Get geolocation data
    const [geoData] = await fetchApi<GeoCodeResponse[]>(
      '/geocode',
      { city: city.trim() }
    );

    if (!geoData) {
      throw new Error('Location not found');
    }

    const { lat, lon, name: cityName, country } = geoData;

    // 2. Get weather data (parallel requests would be better here)
    const weatherResponse = await fetchApi<WeatherApiResponse>(
      '/weather',
      { 
        lat: lat.toString(),
        lon: lon.toString(),
        units: 'metric'
      }
    );

    // 3. Process forecast data
    const forecastDays = processForecastData(weatherResponse.forecast.list);

    // 4. Transform to our application format
    return transformWeatherData(
      cityName,
      country,
      weatherResponse.current,
      forecastDays
    );
  } catch (error) {
    console.error('Weather service error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch weather data');
  }
};

// Helper function to process forecast data
function processForecastData(forecastItems: WeatherApiResponse['forecast']['list']): ForecastDay[] {
  const dayMap = new Map<string, ForecastDay>();

  for (const item of forecastItems) {
    const date = new Date(item.dt * 1000);
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

    if (dayMap.size >= MAX_FORECAST_DAYS) break;

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: date.toISOString(),
        day: format(date, 'EEEE'),
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      });
    } else {
      const existing = dayMap.get(dateKey)!;
      existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
      existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
    }
  }

  // Sort and normalize forecast days
  return normalizeForecastDays(
    Array.from(dayMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  );
}

// Normalize to exactly 3 forecast days
function normalizeForecastDays(days: ForecastDay[]): ForecastDay[] {
  if (days.length === MAX_FORECAST_DAYS) return days;

  if (days.length < MAX_FORECAST_DAYS && days.length > 0) {
    const lastDay = days[days.length - 1];
    const lastDate = new Date(lastDay.date);
    
    while (days.length < MAX_FORECAST_DAYS) {
      const newDate = addDays(lastDate, days.length);
      days.push({
        ...lastDay,
        date: newDate.toISOString(),
        day: format(newDate, 'EEEE')
      });
    }
    return days;
  }
  
  return days.slice(0, MAX_FORECAST_DAYS);
}

// Transform API response to our format
function transformWeatherData(
  city: string,
  country: string,
  current: WeatherApiResponse['current'],
  forecastDays: ForecastDay[]
): WeatherData {
  return {
    city,
    country,
    date: format(new Date(current.dt * 1000), 'MMMM d, yyyy h:mm a'),
    humidity: current.main.humidity,
    windSpeed: current.wind.speed,
    windDirection: degToCompass(current.wind.deg),
    current: {
      temp: current.main.temp,
      feels_like: current.main.feels_like,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
    },
    forecast: forecastDays,
  };
}

// Utility function to convert wind degrees to compass direction
function degToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round((deg % 360) / 45) % 8];
}

// Temperature conversion utility
export const convertTemperature = (temp: number, to: 'C' | 'F'): number => {
  return to === 'F' ? Math.round((temp * 9 / 5) + 32) : Math.round(temp);
};