import { createFileRoute } from '@tanstack/react-router';
import { CovoiturageView } from '@/components/covoiturage/CovoiturageView';

export const Route = createFileRoute('/coach-sante')({
  head: () => ({ meta: [
    { title: "Mobilité — SocialTown" },
    { name: "description", content: "Trajets partagés dans le quartier Mobility Grid de SocialTown." },
    { property: "og:title", content: "Mobilité — SocialTown" },
    { property: "og:description", content: "Trajets partagés dans le quartier Mobility Grid de SocialTown." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <CovoiturageView />,
});
