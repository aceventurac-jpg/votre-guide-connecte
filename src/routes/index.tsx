import { createFileRoute } from '@tanstack/react-router';
import { CityHub } from '@/components/CityHub';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: "SocialTown — City Hub" },
      { name: "description", content: "Ta ville virtuelle arcade : 22 univers, quartiers, IA et services du quotidien." },
      { property: "og:title", content: "SocialTown — City Hub" },
      { property: "og:description", content: "Ta ville virtuelle arcade : 22 univers, quartiers, IA et services du quotidien." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CityHub />,
});
