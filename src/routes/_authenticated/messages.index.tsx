import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { listConversations } from "@/lib/social.functions";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages/")({
  head: () => ({
    meta: [
      { title: "Mes messages — Assistant Citoyen" },
      { name: "description", content: "Vos conversations privées avec les autres membres." },
      { property: "og:title", content: "Mes messages — Assistant Citoyen" },
      { property: "og:description", content: "Vos conversations privées avec les autres membres." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const listFn = useServerFn(listConversations);
  const { data, isLoading } = useQuery({ queryKey: ["conversations"], queryFn: () => listFn({}) });
  const items = data?.conversations ?? [];

  return (
    <AppShell>
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <MessageCircle className="size-6 text-accent" /> Messages
        </h1>
        {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune conversation pour le moment.</p>
        )}
        <div className="space-y-2">
          {items.map((c) => (
            <Link key={c.other_id} to="/messages/$id" params={{ id: c.other_id }} className="block">
              <Card className="p-3 flex items-center justify-between gap-3 hover:border-accent transition">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.other?.name || "Membre"}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.content}</p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs leading-5 text-center">
                    {c.unread}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
