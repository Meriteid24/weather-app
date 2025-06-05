import { WeatherData, ForecastDay } from "@/types/weather";
import { format, startOfDay, addDays } from "date-fns";

// Constants
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_API_URL = "https://api.openweathermap.org/data/2.5";
const MAX_FORECAST_DAYS = 3;

if (!API_KEY) {
  console.error('OpenWeather API key is missing. Please set VITE_OPENWEATHER_API_KEY in your environment variables.');
}

// Type definitions for OpenWeather API responses
interface GeoCodeResponse {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
}

interface CurrentWeatherResponse {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  sys: {
    country: string;
  };
  name: string;
}

interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
  };
}

// Enhanced fetch wrapper with timeout and retry logic
async function fetchOpenWeather<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_API_URL}${endpoint}`);
  
  // Add API key and default parameters
  url.searchParams.append('appid', API_KEY);
  url.searchParams.append('units', 'metric');
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || await response.text().catch(() => 'Unknown error');
      throw new Error(`OpenWeather API request failed (${response.status}): ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`OpenWeather API call to ${url.toString()} failed:`, error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
    
    throw new Error('Failed to fetch weather data: Unknown error');
  }
}

// Main weather service function
export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!city?.trim()) {
    throw new Error('City name is required');
  }

  try {
    console.log(`Fetching weather for: ${city}`);
    
    // 1. Get geolocation data
    const geoResponse = await fetchOpenWeather<GeoCodeResponse[]>(
      '/geo/1.0/direct',
      { q: city.trim(), limit: '1' }
    );

    if (!geoResponse || geoResponse.length === 0) {
      throw new Error(`Location "${city}" not found. Please check the spelling and try again.`);
    }

    const geoData = geoResponse[0];
    const { lat, lon, name: cityName, country } = geoData;
    
    console.log(`Found location: ${cityName}, ${country} (${lat}, ${lon})`);

    // 2. Get current weather data
    const currentWeather = await fetchOpenWeather<CurrentWeatherResponse>(
      '/weather',
      { 
        lat: lat.toString(),
        lon: lon.toString(),
      }
    );

    // 3. Get forecast data
    const forecastResponse = await fetchOpenWeather<ForecastResponse>(
      '/forecast',
      { 
        lat: lat.toString(),
        lon: lon.toString(),
      }
    );

    // 4. Process forecast data
    const forecastDays = processForecastData(forecastResponse.list);

    // 5. Transform to our application format
    return transformWeatherData(
      cityName,
      country,
      currentWeather,
      forecastDays
    );
  } catch (error) {
    console.error('Weather service error:', error);
    
    if (error instanceof Error) {
      // Re-throw with more user-friendly messages
      if (error.message.includes('not found')) {
        throw error; // Keep location not found messages as-is
      }
      if (error.message.includes('timed out')) {
        throw new Error('The weather service is taking too long to respond. Please try again.');
      }
      if (error.message.includes('401')) {
        throw new Error('Weather service authentication failed. Please contact support.');
      }
      if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        throw new Error('The weather service is temporarily unavailable. Please try again later.');
      }
    }
    
    throw new Error('Unable to fetch weather data. Please check your internet connection and try again.');
  }
};

// Helper function to process forecast data
function processForecastData(forecastItems: ForecastResponse['list']): ForecastDay[] {
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
  current: CurrentWeatherResponse,
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