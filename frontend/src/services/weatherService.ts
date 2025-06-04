console.log('API_URL =', process.env.NEXT_PUBLIC_API_URL);
import { WeatherData, ForecastDay } from "@/types/weather";
import { format, startOfDay } from "date-fns";

// Single source of truth for API URL
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://weather-app-hqyy.onrender.com";

// Helper function for API calls
async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, BASE_API_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!city?.trim()) {
    throw new Error('City name is required');
  }

  try {
    // 1. Get location data
    const geoData = await fetchApi<any[]>(
      '/geocode',
      { city: city.trim() }
    );

    if (!geoData?.length) {
      throw new Error('Location not found');
    }

    const { lat, lon, name: cityName, country } = geoData[0];

    // 2. Get weather data
    const { current, forecast } = await fetchApi<{
      current: any;
      forecast: { list: any[] };
    }>(
      '/weather',
      { 
        lat: lat.toString(),
        lon: lon.toString(),
        units: 'metric'
      }
    );

    // 3. Process forecast into unique day summaries
    const groupedForecast: Record<string, ForecastDay> = {};
    const uniqueDays = new Set<string>();

    for (const item of forecast.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

      if (uniqueDays.size >= 3) continue;

      if (!groupedForecast[dateKey]) {
        groupedForecast[dateKey] = {
          date: date.toISOString(),
          day: formatDayName(date.toISOString()),
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
        uniqueDays.add(dateKey);
      } else {
        groupedForecast[dateKey].minTemp = Math.min(
          groupedForecast[dateKey].minTemp,
          item.main.temp_min
        );
        groupedForecast[dateKey].maxTemp = Math.max(
          groupedForecast[dateKey].maxTemp,
          item.main.temp_max
        );
      }
    }

    // Get sorted forecast days
    let forecastDays = Object.values(groupedForecast)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Ensure we have exactly 3 days
    forecastDays = normalizeForecastDays(forecastDays);

    // 4. Transform data
    const transformedData: WeatherData = {
      city: cityName,
      country,
      date: formatDateToHumanReadable(new Date(current.dt * 1000).toISOString()),
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

    console.log('Processed forecast:', {
      days: forecastDays.map(d => `${d.day} (${format(new Date(d.date), 'MMM dd')})`),
      temps: forecastDays.map(d => `${d.minTemp}°C - ${d.maxTemp}°C`)
    });

    return transformedData;
  } catch (error) {
    console.error('Weather API Error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch weather data');
  }
};

// Helper function to ensure exactly 3 forecast days
function normalizeForecastDays(days: ForecastDay[]): ForecastDay[] {
  if (days.length === 3) return days;
  
  if (days.length < 3) {
    const lastDay = days[days.length - 1];
    const lastDate = new Date(lastDay.date);
    
    while (days.length < 3) {
      const newDate = new Date(lastDate);
      newDate.setDate(newDate.getDate() + days.length);
      
      days.push({
        ...lastDay,
        date: newDate.toISOString(),
        day: formatDayName(newDate.toISOString())
      });
    }
    return days;
  }
  
  return days.slice(0, 3);
}

// Utility functions
function degToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

export const formatDateToHumanReadable = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy h:mm a');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const formatDayName = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE');
  } catch (error) {
    console.error("Error formatting day name:", error);
    return "";
  }
};

export const convertTemperature = (temp: number, to: 'C' | 'F'): number => {
  return to === 'F' ? Math.round((temp * 9 / 5) + 32) : Math.round(temp);
};