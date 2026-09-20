import { createFileRoute } from '@tanstack/react-router';
import { WeatherSmartView } from '@/components/meteo/WeatherSmartView';

export const Route = createFileRoute('/weather-smart')({
  component: () => <WeatherSmartView />,
});
