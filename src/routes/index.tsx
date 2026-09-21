import { createFileRoute } from '@tanstack/react-router';
import { ChatHome } from '@/components/ChatHome';

export const Route = createFileRoute('/')({
  component: () => <ChatHome />,
});
