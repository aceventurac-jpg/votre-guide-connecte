import { createFileRoute } from '@tanstack/react-router';
import { CovoiturageView } from '@/components/covoiturage/CovoiturageView';

export const Route = createFileRoute('/coach-sante')({
  component: () => <CovoiturageView />,
});
