import { createFileRoute } from '@tanstack/react-router';
import { CovoiturageView } from '@/components/covoiturage/CovoiturageView';

export const Route = createFileRoute('/tv-feed')({
  head: () => ({ meta: [
    { title: "Trajets partagés — SocialTown" },
    { name: "description", content: "Retrouvez la vue des trajets partagés de SocialTown." },
    { property: "og:title", content: "Trajets partagés — SocialTown" },
    { property: "og:description", content: "Retrouvez la vue des trajets partagés de SocialTown." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <CovoiturageView />,
});
