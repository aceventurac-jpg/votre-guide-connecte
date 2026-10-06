import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CATEGORIES, TYPES, CONTEXTS, createListing, listListings } from "@/lib/listings.functions";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsAuthed } from "@/hooks/use-auth";
import { Plus, Star, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/listings")({
  head: () => ({ meta: [{ title: "Annonces — SocialTown" }] }),
  component: ListingsPage,
});

function ListingsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listListings);
  const createFn = useServerFn(createListing);
  const { authed } = useIsAuthed();
  const navigate = useNavigate();
  const [cat, setCat] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [ctx, setCtx] = useState<string>("all");
  const [open, setOpen] = useState(false);

  function openPublish() {
    if (!authed) { navigate({ to: "/auth" }); return; }
    setOpen(true);
  }

  const { data } = useQuery({
    queryKey: ["listings", cat, type, ctx],
    queryFn: () =>
      listFn({
        data: {
          category: cat === "all" ? undefined : (cat as (typeof CATEGORIES)[number]),
          listing_type: type === "all" ? undefined : (type as (typeof TYPES)[number]),
          context: ctx === "all" ? undefined : (ctx as (typeof CONTEXTS)[number]),
        },
      }),
  });

  const create = useMutation({
    mutationFn: (payload: CreatePayload) => createFn({ data: payload }),
    onSuccess: () => {
      toast.success("Annonce publiée !");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  return (
    <AppShell>
      <div className="max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Annonces communautaires</h1>
            <p className="text-sm text-muted-foreground">
              Vente, location, covoiturage, service ou tutorat — entre membres vérifiés.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={openPublish}><Plus className="size-4 mr-1" /> Publier</Button>
            <NewListingDialog onSubmit={(p) => create.mutate(p)} pending={create.isPending} />
          </Dialog>
        </div>

        <div className="rounded-xl border bg-mauve-soft/40 p-4 flex gap-3 text-sm">
          <ShieldCheck className="size-5 text-accent shrink-0 mt-0.5" />
          <div>
            <strong>Conseils de sécurité.</strong> Ne paie jamais d'avance, privilégie les remises en main propre dans
            un lieu public, et vérifie l'identité de ton interlocuteur avant tout engagement. Utilise la messagerie
            interne — ne partage tes coordonnées qu'après accord mutuel.
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ctx} onValueChange={setCtx}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Contexte" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous contextes</SelectItem>
              <SelectItem value="loisirs">Loisirs</SelectItem>
              <SelectItem value="professionnel">Professionnel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.listings ?? []).map((l) => (
            <Link
              key={l.id}
              to="/listings/$id"
              params={{ id: l.id }}
              className="block group"
            >
              <Card className="p-4 h-full hover:border-accent transition space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="badge-agent">{l.category}</span>
                  <span className="text-xs text-muted-foreground">{l.listing_type}</span>
                </div>
                <h3 className="font-medium line-clamp-2">{l.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                {l.subject && <p className="text-xs text-muted-foreground">📚 {l.subject} {l.level && `· ${l.level}`}</p>}
                <div className="flex justify-between items-center pt-2 border-t mt-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {l.seller?.name || "Membre"}
                    {l.seller?.verified && <ShieldCheck className="size-3 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2">
                    {l.rating && (
                      <span className="text-xs flex items-center gap-0.5">
                        <Star className="size-3 fill-accent text-accent" /> {Number(l.rating.avg_rating).toFixed(1)}
                      </span>
                    )}
                    {l.is_free ? <span className="text-sm font-semibold text-emerald-600">Gratuit</span> : (l.price != null && <span className="text-sm font-semibold">{Number(l.price).toFixed(2)} €</span>)}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {data?.listings?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <AlertTriangle className="size-8 mx-auto mb-2" /> Aucune annonce ne correspond.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

type CreatePayload = {
  category: (typeof CATEGORIES)[number];
  listing_type: (typeof TYPES)[number];
  context: (typeof CONTEXTS)[number];
  title: string;
  description: string;
  price?: number | null;
  is_free?: boolean;
  subject?: string | null;
  level?: string | null;
  city?: string | null;
};

function NewListingDialog({ onSubmit, pending }: { onSubmit: (p: CreatePayload) => void; pending: boolean }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Services Locaux");
  const [listing_type, setType] = useState<(typeof TYPES)[number]>("Service");
  const [ctx, setCtx] = useState<(typeof CONTEXTS)[number]>("loisirs");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [city, setCity] = useState("");

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Publier une annonce</DialogTitle></DialogHeader>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const effectiveFree = isFree || listing_type === "Troc/Don";
          onSubmit({
            category, listing_type, context: ctx, title, description,
            price: effectiveFree ? null : (price ? Number(price) : null),
            is_free: effectiveFree,
            subject: listing_type === "Tutorat" ? subject || null : null,
            level: listing_type === "Tutorat" ? level || null : null,
            city: city || null,
          });
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={listing_type} onValueChange={(v) => setType(v as typeof listing_type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Contexte</Label>
          <Select value={ctx} onValueChange={(v) => setCtx(v as typeof ctx)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="loisirs">Loisirs / Particulier</SelectItem>
              <SelectItem value="professionnel">Professionnel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Titre</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Prix (€)</Label>
            <Input
              type="number" min={0} step="0.01" value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isFree || listing_type === "Troc/Don"}
              placeholder={listing_type === "Troc/Don" ? "Gratuit" : ""}
            />
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFree || listing_type === "Troc/Don"} disabled={listing_type === "Troc/Don"} onChange={(e) => setIsFree(e.target.checked)} />
          Gratuit (don)
        </label>
        {listing_type === "Tutorat" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Matière</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Maths" />
            </div>
            <div>
              <Label>Niveau</Label>
              <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="3e" />
            </div>
          </div>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "..." : "Publier"}
        </Button>
      </form>
    </DialogContent>
  );
}
