import { WeatherData, ForecastDay } from "@/types/weather";
import { format, startOfDay } from "date-fns";

const API_URL = '/api';
const API = process.env.NEXT_PUBLIC_API_URL;

fetch(`${API}/weather`)


export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!city?.trim()) {
    throw new Error('City name is required');
  }

  try {
    // 1. Get location data
    const geoResponse = await fetch(`${API_URL}/geocode?city=${encodeURIComponent(city.trim())}`);
    const geoData = await geoResponse.json();

    if (!geoResponse.ok || !geoData?.length) {
      throw new Error('Location not found');
    }

    const { lat, lon, name: cityName, country } = geoData[0];

    // 2. Get weather data
    const weatherResponse = await fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}&units=metric`);
    const { current, forecast } = await weatherResponse.json();

    // 3. Process forecast into unique day summaries
    const groupedForecast: { [dateKey: string]: ForecastDay } = {};
    const uniqueDays = new Set<string>();

    for (const item of forecast.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

      // Only process if we don't have 3 unique days yet
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
        groupedForecast[dateKey].minTemp = Math.min(groupedForecast[dateKey].minTemp, item.main.temp_min);
        groupedForecast[dateKey].maxTemp = Math.max(groupedForecast[dateKey].maxTemp, item.main.temp_max);
      }
    }

    // Get sorted forecast days
    let forecastDays = Object.values(groupedForecast)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Ensure we have exactly 3 days
    if (forecastDays.length < 3) {
      const lastDay = forecastDays[forecastDays.length - 1];
      const lastDate = new Date(lastDay.date);
      
      while (forecastDays.length < 3) {
        const newDate = new Date(lastDate);
        newDate.setDate(newDate.getDate() + (forecastDays.length));
        
        forecastDays.push({
          ...lastDay,
          date: newDate.toISOString(),
          day: formatDayName(newDate.toISOString())
        });
      }
    } else if (forecastDays.length > 3) {
      forecastDays = forecastDays.slice(0, 3);
    }

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
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch weather data'
    );
  }
};

// Helpers remain exactly the same
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