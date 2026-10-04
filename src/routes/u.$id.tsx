import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicProfile, toggleFollow } from "@/lib/social.functions";
import { useIsAuthed } from "@/hooks/use-auth";
import { MapPin, MessageCircle, Star, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/u/$id")({
  head: () => ({
    meta: [
      { title: "Profil d'un membre — Assistant Citoyen" },
      { name: "description", content: "Publications, annonces et avis d'un membre de la communauté Assistant Citoyen." },
      { property: "og:title", content: "Profil d'un membre — Assistant Citoyen" },
      { property: "og:description", content: "Publications, annonces et avis d'un membre de la communauté." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { id } = useParams({ from: "/u/$id" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { authed } = useIsAuthed();
  const getFn = useServerFn(getPublicProfile);
  const followFn = useServerFn(toggleFollow);

  const { data, isLoading } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => getFn({ data: { user_id: id } }),
  });

  const follow = useMutation({
    mutationFn: () => followFn({ data: { user_id: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["public-profile", id] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const p = data?.profile;
  const isMe = data?.me === id;

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && !p && <p className="text-sm text-muted-foreground">Ce membre est introuvable.</p>}
        {p && (
          <>
            <Card className="p-5 flex flex-wrap items-center gap-4">
              <div className="size-20 rounded-full overflow-hidden bg-secondary shrink-0">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={`Photo de ${p.name}`} className="size-full object-cover" />
                ) : (
                  <div className="size-full grid place-items-center text-2xl font-semibold text-muted-foreground">
                    {(p.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold">{p.name || "Membre"}</h1>
                {p.city && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3.5" /> {p.city}
                  </p>
                )}
                {p.bio && <p className="text-sm mt-1 whitespace-pre-wrap">{p.bio}</p>}
                <p className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-3">
                  <span>{data.followers} abonné{data.followers > 1 ? "s" : ""}</span>
                  <span>{data.following} abonnement{data.following > 1 ? "s" : ""}</span>
                  {data.rating !== null && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-current text-accent" /> {data.rating} ({data.reviews_count})
                    </span>
                  )}
                </p>
              </div>
              {!isMe && (
                <div className="flex gap-2">
                  <Button
                    variant={data.is_following ? "outline" : "default"}
                    onClick={() => (authed ? follow.mutate() : navigate({ to: "/auth" }))}
                    disabled={follow.isPending}
                  >
                    {data.is_following ? <UserCheck className="size-4 mr-1" /> : <UserPlus className="size-4 mr-1" />}
                    {data.is_following ? "Suivi" : "Suivre"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (authed ? navigate({ to: "/messages" as any }) : navigate({ to: "/auth" }))}
                  >
                    <MessageCircle className="size-4 mr-1" /> Message
                  </Button>
                </div>
              )}
            </Card>

            <section className="space-y-2">
              <h2 className="font-semibold">Ses publications</h2>
              {data.posts.length === 0 && <p className="text-sm text-muted-foreground">Aucune publication.</p>}
              {data.posts.map((post) => (
                <Link key={post.id} to="/community/$id" params={{ id: post.id }} className="block">
                  <Card className="p-3 hover:border-accent transition">
                    <p className="text-sm line-clamp-2 whitespace-pre-wrap">{post.content}</p>
                  </Card>
                </Link>
              ))}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Ses annonces</h2>
              {data.listings.length === 0 && <p className="text-sm text-muted-foreground">Aucune annonce active.</p>}
              {data.listings.map((l) => (
                <Link key={l.id} to="/listings/$id" params={{ id: l.id }} className="block">
                  <Card className="p-3 flex items-center justify-between gap-3 hover:border-accent transition">
                    <span className="text-sm font-medium">{l.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {l.is_free ? "Gratuit" : l.price ? `${l.price} €` : l.listing_type}
                    </span>
                  </Card>
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
