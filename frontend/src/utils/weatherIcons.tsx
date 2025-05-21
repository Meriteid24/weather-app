
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudSun
} from "lucide-react";

// Map OpenWeatherMap icon codes to Lucide React icons
export const getWeatherIcon = (iconCode: string, size: number = 24) => {
  // First character is d (day) or n (night)
  // Second character is the weather condition
  const condition = iconCode.slice(0, 2);
  
  switch (condition) {
    case "01": // clear sky
      return <Sun size={size} className="text-yellow-500" />;
    case "02": // few clouds
    case "03": // scattered clouds
      return <CloudSun size={size} className="text-gray-500" />;
    case "04": // broken clouds
      return <Cloud size={size} className="text-gray-500" />;
    case "09": // shower rain
      return <CloudDrizzle size={size} className="text-blue-500" />;
    case "10": // rain
      return <CloudRain size={size} className="text-blue-500" />;
    case "11": // thunderstorm
      return <CloudLightning size={size} className="text-purple-500" />;
    case "13": // snow
      return <CloudSnow size={size} className="text-blue-200" />;
    case "50": // mist/fog
      return <CloudFog size={size} className="text-gray-400" />;
    default:
      return <Sun size={size} className="text-yellow-500" />;
  }
};

// Get background color class based on temperature
export const getTempColorClass = (temp: number): string => {
  if (temp <= 0) return "bg-blue-100";
  if (temp <= 10) return "bg-blue-50";
  if (temp <= 20) return "bg-yellow-50";
  if (temp <= 30) return "bg-orange-50";
  return "bg-red-50";
};

// Get text color class based on temperature
export const getTempTextColorClass = (temp: number): string => {
  if (temp <= 0) return "text-blue-700";
  if (temp <= 10) return "text-blue-600";
  if (temp <= 20) return "text-yellow-600";
  if (temp <= 30) return "text-orange-600";
  return "text-red-600";
};
