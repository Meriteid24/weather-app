import React from "react";
import { ForecastDay, TemperatureUnit } from "@/types/weather";
import { getWeatherIcon, getTempColorClass } from "@/utils/weatherIcons";
import { Card, CardContent } from "@/components/ui/card";

interface ForecastSectionProps {
  forecast: ForecastDay[];
  unit: TemperatureUnit;
  displayTemp: (temp: number) => number;
}

export default function ForecastSection({ forecast, unit, displayTemp }: ForecastSectionProps) {
  // Ensure we only show exactly 3 forecast days
  const displayForecast = forecast.slice(0, 3);
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-5 text-weather-text">3-Day Forecast</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {displayForecast.map((day, index) => (
          <Card 
            key={index}
            className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <CardContent className="p-5 flex flex-col items-center">
              <div className="text-md font-medium mb-3 text-weather-text">
                {day.day}
              </div>
              <div className="text-5xl mb-3">
                {getWeatherIcon(day.icon, 56)}
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-600 mb-2">{day.description}</div>
                <span className={`text-lg font-bold px-3 py-1 rounded-full ${getTempColorClass(day.maxTemp)}`}>
                  {displayTemp(day.minTemp)}°-{displayTemp(day.maxTemp)}°{unit}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
