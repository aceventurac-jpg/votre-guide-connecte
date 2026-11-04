import { createFileRoute } from '@tanstack/react-router';
import { WeatherSmartView } from '@/components/meteo/WeatherSmartView';

export const Route = createFileRoute('/weather-smart')({
  head: () => ({ meta: [
    { title: "Météo intelligente — SocialTown" },
    { name: "description", content: "Consultez les conditions météo dans le quartier Mobility Grid de SocialTown." },
    { property: "og:title", content: "Météo intelligente — SocialTown" },
    { property: "og:description", content: "Consultez les conditions météo dans le quartier Mobility Grid de SocialTown." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <WeatherSmartView />,
});
