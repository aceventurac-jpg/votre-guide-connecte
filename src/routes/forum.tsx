import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HandHeart, MessageSquare, MapPin } from "lucide-react";
import { listForumTopics, createForumTopic } from "@/lib/forum.functions";
import { useIsAuthed } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      { title: "Entraide locale — SocialTown" },
      { name: "description", content: "Demande ou propose un coup de main près de chez toi : courses, bricolage, garde, transport." },
      { property: "og:title", content: "Entraide locale — SocialTown" },
      { property: "og:description", content: "Demande ou propose un coup de main près de chez toi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForumPage,
});

function ForumPage() {
  const qc = useQueryClient();
  const { authed } = useIsAuthed();
  const listFn = useServerFn(listForumTopics);
  const createFn = useServerFn(createForumTopic);

  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCity, setPostCity] = useState("");

  const { data } = useQuery({
    queryKey: ["forum-topics", city],
    queryFn: () => listFn({ data: city.trim() ? { city: city.trim() } : undefined }),
  });

  const create = useMutation({
    mutationFn: () =>
      createFn({ data: { title: title.trim(), content: content.trim(), city: postCity.trim() || null, category: "entraide" } }),
    onSuccess: () => {
      setTitle(""); setContent("");
      toast.success("Demande publiée.");
      qc.invalidateQueries({ queryKey: ["forum-topics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const topics = data?.topics ?? [];

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
            <HandHeart className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Entraide locale</h1>
            <p className="text-sm text-muted-foreground">Un coup de main à demander ou à offrir près de chez toi.</p>
          </div>
        </div>

        <Input placeholder="Filtrer par ville" value={city} onChange={(e) => setCity(e.target.value)} />

        {authed ? (
          <Card className="p-4 space-y-3">
            <Input placeholder="Ma demande en une phrase" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Explique ce dont tu as besoin (ou ce que tu proposes)" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
            <Input placeholder="Ville" value={postCity} onChange={(e) => setPostCity(e.target.value)} />
            <Button onClick={() => create.mutate()} disabled={create.isPending || title.trim().length < 4 || content.trim().length < 5}>
              {create.isPending ? "Publication…" : "Publier ma demande"}
            </Button>
          </Card>
        ) : (
          <Card className="p-4 text-sm text-muted-foreground">
            <Link to="/auth" className="text-accent underline">Connecte-toi</Link> pour publier une demande. La lecture est libre.
          </Card>
        )}

        <div className="space-y-2">
          {topics.length === 0 && <Card className="p-8 text-center text-muted-foreground">Aucune demande pour l'instant.</Card>}
          {topics.map((t) => (
            <Link key={t.id} to="/forum/$id" params={{ id: t.id }}>
              <Card className="p-4 hover:border-accent transition space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {t.city && (<span className="inline-flex items-center gap-1"><MapPin className="size-3" />{t.city}</span>)}
                  <span className="inline-flex items-center gap-1"><MessageSquare className="size-3" />{t.reply_count}</span>
                </div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.content}</p>
                <p className="text-xs text-muted-foreground">Par {t.author?.name || "Membre"}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
