import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin } from "lucide-react";
import { getForumTopic, createForumReply } from "@/lib/forum.functions";
import { useIsAuthed } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/forum/$id")({
  head: () => ({
    meta: [
      { title: "Demande d'entraide — Assistant Citoyen" },
      { name: "description", content: "Réponds à une demande d'entraide de ton quartier." },
      { property: "og:title", content: "Demande d'entraide — Assistant Citoyen" },
      { property: "og:description", content: "Réponds à une demande d'entraide de ton quartier." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TopicPage,
});

function TopicPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { authed } = useIsAuthed();
  const getFn = useServerFn(getForumTopic);
  const replyFn = useServerFn(createForumReply);
  const [text, setText] = useState("");

  const { data } = useQuery({ queryKey: ["forum-topic", id], queryFn: () => getFn({ data: { id } }) });

  const reply = useMutation({
    mutationFn: () => replyFn({ data: { topic_id: id, content: text.trim() } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["forum-topic", id] });
      toast.success("Réponse envoyée.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-4">
        <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Entraide locale
        </Link>

        {data && (
          <>
            <Card className="p-4 space-y-2">
              <h1 className="text-xl font-semibold">{data.topic.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Par {data.topic.author?.name || "Membre"}</span>
                {data.topic.city && (<span className="inline-flex items-center gap-1"><MapPin className="size-3" />{data.topic.city}</span>)}
              </div>
              <p className="text-sm whitespace-pre-wrap">{data.topic.content}</p>
            </Card>

            <div className="space-y-2">
              {data.replies.map((r) => (
                <Card key={r.id} className="p-3">
                  <p className="text-xs text-muted-foreground mb-1">{r.author?.name || "Membre"}</p>
                  <p className="text-sm whitespace-pre-wrap">{r.content}</p>
                </Card>
              ))}
              {data.replies.length === 0 && <p className="text-sm text-muted-foreground">Personne n'a encore répondu.</p>}
            </div>

            {authed ? (
              <Card className="p-4 space-y-2">
                <Textarea rows={3} placeholder="Proposer mon aide…" value={text} onChange={(e) => setText(e.target.value)} />
                <Button onClick={() => reply.mutate()} disabled={reply.isPending || !text.trim()}>Répondre</Button>
              </Card>
            ) : (
              <Card className="p-4 text-sm text-muted-foreground">
                <Link to="/auth" className="text-accent underline">Connecte-toi</Link> pour répondre.
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
