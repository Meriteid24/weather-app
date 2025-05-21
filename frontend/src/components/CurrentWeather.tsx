
import React from "react";
import { WeatherData, TemperatureUnit } from "@/types/weather";
import { getWeatherIcon, getTempColorClass, getTempTextColorClass } from "@/utils/weatherIcons";
import { Card, CardContent } from "@/components/ui/card";

interface CurrentWeatherProps {
  data: WeatherData;
  unit: TemperatureUnit;
  displayTemp: (temp: number) => number;
}

export default function CurrentWeather({ data, unit, displayTemp }: CurrentWeatherProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          {/* Current Weather Icon and Info */}
          <div className="mb-3 text-7xl">
            {getWeatherIcon(data.current.icon, 84)}
          </div>
          <div className="text-5xl font-bold mt-2">
            {displayTemp(data.current.temp)}°{unit}
          </div>
          <div className="text-xl font-medium text-white/90 mt-2">
            {data.current.description}
          </div>
          <div className="text-sm text-white/80 mt-4">
            {data.date}
          </div>
          <div className="text-lg font-medium mt-1 flex items-center">
            <span>{data.city}, {data.country}</span>
          </div>
        </CardContent>
      </Card>

      {data.forecast.slice(0, 2).map((day, index) => (
        <Card 
          key={index}
          className="border-none shadow-md bg-white/90 dark:bg-gray-700/90"
        >
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-md font-medium mb-3 text-gray-700 dark:text-gray-200">
              {day.day}
            </div>
            <div className="text-4xl mb-3">
              {getWeatherIcon(day.icon, 60)}
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{day.description}</div>
              <span className={`text-lg font-bold ${getTempTextColorClass(day.maxTemp)}`}>
                {displayTemp(day.minTemp)}°-{displayTemp(day.maxTemp)}°{unit}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
