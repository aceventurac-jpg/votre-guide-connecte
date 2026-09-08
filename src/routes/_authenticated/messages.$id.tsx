import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listDirectThread, sendDirectMessage } from "@/lib/social.functions";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/messages/$id")({
  head: () => ({
    meta: [
      { title: "Conversation — Assistant Citoyen" },
      { name: "description", content: "Discutez en privé avec un membre de la communauté." },
      { property: "og:title", content: "Conversation — Assistant Citoyen" },
      { property: "og:description", content: "Discutez en privé avec un membre de la communauté." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { id } = useParams({ from: "/_authenticated/messages/$id" });
  const qc = useQueryClient();
  const threadFn = useServerFn(listDirectThread);
  const sendFn = useServerFn(sendDirectMessage);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["thread", id],
    queryFn: () => threadFn({ data: { other_id: id } }),
  });

  useEffect(() => {
    const channel = supabase
      .channel(`dm-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["thread", id] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, qc]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const send = useMutation({
    mutationFn: (content: string) => sendFn({ data: { receiver_id: id, content } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["thread", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const me = data?.me;

  return (
    <AppShell>
      <div className="max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-2">
          <Link to="/messages" aria-label="Retour aux messages">
            <Button variant="ghost" size="sm"><ArrowLeft className="size-4" /></Button>
          </Link>
          <Link to="/u/$id" params={{ id }} className="font-semibold hover:underline">
            {data?.other?.name || "Membre"}
          </Link>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {(data?.messages ?? []).map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === me ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.sender_id === me ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(text.trim()); }}
        >
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message…" maxLength={2000} />
          <Button type="submit" disabled={send.isPending || !text.trim()}><Send className="size-4" /></Button>
        </form>
      </div>
    </AppShell>
  );
}
