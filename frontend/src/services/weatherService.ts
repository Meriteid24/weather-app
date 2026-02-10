import { WeatherData } from "@/types/weather";

const BACKEND_API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!city.trim()) throw new Error("City name is required");

  const url = new URL(`${BACKEND_API_BASE}/api/weather`);
  url.searchParams.append("city", city.trim());

  try {
    const response = await fetch(url.toString(), { 
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
};

// Temp conversion utility
export const convertTemperature = (temp: number, to: "C" | "F"): number => 
  (to === "F" ? Math.round((temp * 9) / 5 + 32) : Math.round(temp));