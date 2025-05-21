
export interface WeatherData {
  city: string;
  country: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  humidity: number;
  windSpeed: number;
  windDirection: string;
  date: string;
}

export interface CurrentWeather {
  temp: number;
  description: string;
  icon: string;
  feels_like?: number;
}

export interface ForecastDay {
  date: string;
  day: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
}

export type TemperatureUnit = 'C' | 'F';
