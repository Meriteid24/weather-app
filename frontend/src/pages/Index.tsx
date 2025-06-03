
import WeatherApp from "@/components/WeatherApp";

const Index = () => {
  return <WeatherApp />;
};

export default Index;

console.log("ENV VAR:", process.env.NEXT_PUBLIC_API_URL);
