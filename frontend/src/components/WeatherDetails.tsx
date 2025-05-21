
import React from "react";
import { Wind, Droplet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeatherDetailsProps {
  windSpeed: number;
  humidity: number;
}

export default function WeatherDetails({
  windSpeed,
  humidity
}: WeatherDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card className="border-none shadow-md bg-white/90 dark:bg-gray-700/90">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center">
            <Wind size={20} className="text-blue-500 mr-2" />
            Wind Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {windSpeed} <span className="text-xl text-gray-500">km/h</span>
            </div>
            <div className="flex items-center mt-3 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
              <Wind size={18} className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">WSW wind</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-white/90 dark:bg-gray-700/90">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center">
            <Droplet size={20} className="text-blue-500 mr-2" />
            Humidity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">{humidity}%</div>
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
              <Progress value={humidity} className="h-2" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {humidity < 30 ? "Low" : humidity < 60 ? "Normal" : "High"} humidity
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
