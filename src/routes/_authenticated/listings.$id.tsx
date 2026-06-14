import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getListing, deleteListing } from "@/lib/listings.functions";
import { sendInternalMessage, getThread, submitReview, reportListing } from "@/lib/community.functions";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ShieldCheck, Star, Flag, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/listings/$id")({
  head: () => ({ meta: [{ title: "Annonce — Assistant Citoyen" }] }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getListing);
  const sendMsg = useServerFn(sendInternalMessage);
  const threadFn = useServerFn(getThread);
  const reviewFn = useServerFn(submitReview);
  const reportFn = useServerFn(reportListing);
  const delFn = useServerFn(deleteListing);
  const [me, setMe] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const { data } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const otherId = data?.listing?.user_id;
  const isOwner = me && otherId && me === otherId;

  const { data: thread } = useQuery({
    queryKey: ["thread", id, me],
    enabled: !!me && !!otherId && !isOwner,
    queryFn: () => threadFn({ data: { listing_id: id, other_id: otherId! } }),
  });

  const send = useMutation({
    mutationFn: (content: string) => sendMsg({ data: { listing_id: id, receiver_id: otherId!, content } }),
    onSuccess: () => { setMsg(""); qc.invalidateQueries({ queryKey: ["thread", id] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const review = useMutation({
    mutationFn: () => reviewFn({ data: { listing_id: id, reviewed_id: otherId!, rating, comment: comment || undefined } }),
    onSuccess: () => { toast.success("Avis publié !"); setComment(""); qc.invalidateQueries({ queryKey: ["listing", id] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const report = useMutation({
    mutationFn: () => reportFn({ data: { listing_id: id, reason } }),
    onSuccess: () => { toast.success("Annonce signalée."); setReason(""); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const del = useMutation({
    mutationFn: () => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Annonce supprimée."); window.location.href = "/listings"; },
  });

  if (!data) return <AppShell><div className="p-8 text-center text-muted-foreground">Chargement...</div></AppShell>;
  const { listing, seller, rating: avgR } = data;

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-5">
        <Link to="/listings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Toutes les annonces
        </Link>

        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="badge-agent">{listing.category}</span>
                <span className="text-xs text-muted-foreground self-center">{listing.listing_type}</span>
              </div>
              <h1 className="text-2xl font-semibold">{listing.title}</h1>
              {listing.city && <p className="text-sm text-muted-foreground">📍 {listing.city}</p>}
            </div>
            {listing.price != null && (
              <div className="text-2xl font-semibold text-accent">{Number(listing.price).toFixed(2)} €</div>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap">{listing.description}</p>
          {listing.subject && (
            <p className="text-sm text-muted-foreground">📚 {listing.subject} {listing.level && `· Niveau ${listing.level}`}</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm">
              <span className="font-medium">{seller?.name || "Membre"}</span>
              {seller?.verified && <ShieldCheck className="inline size-4 ml-1 text-primary" />}
              {avgR && (
                <span className="ml-3 text-muted-foreground inline-flex items-center gap-1">
                  <Star className="size-3 fill-accent text-accent" />
                  {Number(avgR.avg_rating).toFixed(1)} ({avgR.review_count})
                </span>
              )}
            </div>
            {isOwner ? (
              <Button variant="ghost" size="sm" onClick={() => confirm("Supprimer ?") && del.mutate()}>
                <Trash2 className="size-4 mr-1" /> Supprimer
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm"><Flag className="size-4 mr-1" /> Signaler</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Signaler cette annonce</DialogTitle></DialogHeader>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du signalement (5 caractères min)" />
                  <Button disabled={reason.length < 5 || report.isPending} onClick={() => report.mutate()}>Envoyer</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>

        {!isOwner && me && (
          <Card className="p-5 space-y-3">
            <h2 className="font-medium">Messagerie privée</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(thread?.messages ?? []).map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === me ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.sender_id === me ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {thread?.messages?.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">Pas encore de messages. Lance la conversation.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Écris un message..." />
              <Button onClick={() => msg.trim() && send.mutate(msg.trim())} disabled={!msg.trim() || send.isPending}>
                <Send className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Ne communique tes coordonnées qu'après accord mutuel.</p>
          </Card>
        )}

        {!isOwner && me && (
          <Card className="p-5 space-y-3">
            <h2 className="font-medium">Laisser un avis</h2>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} type="button">
                  <Star className={`size-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ton commentaire (optionnel)" rows={2} />
            <Button onClick={() => review.mutate()} disabled={review.isPending}>Publier l'avis</Button>
          </Card>
        )}

        {data.reviews.length > 0 && (
          <Card className="p-5 space-y-3">
            <h2 className="font-medium">Avis ({data.reviews.length})</h2>
            {data.reviews.map((r) => (
              <div key={r.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3 fill-accent text-accent" />)}
                </div>
                {r.comment && <p className="text-sm">{r.comment}</p>}
              </div>
            ))}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
