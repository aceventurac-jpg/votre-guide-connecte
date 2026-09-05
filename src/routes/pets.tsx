import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PawPrint, MapPin, Trash2, Check, X } from "lucide-react";
import { listPets, createPet, deletePet, requestMeetup, listMeetups, respondMeetup, SPECIES } from "@/lib/pets.functions";
import { useIsAuthed } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/pets")({
  head: () => ({
    meta: [
      { title: "Animaux — rencontres et balades | Assistant Citoyen" },
      { name: "description", content: "Présente ton animal, trouve des compagnons de balade près de chez toi et organise une rencontre." },
      { property: "og:title", content: "Animaux — rencontres et balades" },
      { property: "og:description", content: "Trouve des compagnons de balade près de chez toi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PetsPage,
});

type PetRow = {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  city: string | null;
  photo_url: string | null;
  description: string | null;
  owner: { id: string; name: string | null; city: string | null } | null;
  mine: boolean;
};

function PetsPage() {
  const qc = useQueryClient();
  const { authed } = useIsAuthed();
  const listFn = useServerFn(listPets);
  const createFn = useServerFn(createPet);
  const delFn = useServerFn(deletePet);
  const askFn = useServerFn(requestMeetup);
  const meetupsFn = useServerFn(listMeetups);
  const respondFn = useServerFn(respondMeetup);

  const [city, setCity] = useState("");
  const [target, setTarget] = useState<PetRow | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({ name: "", species: "chien", breed: "", age: "", city: "", photo: "", desc: "" });

  const { data } = useQuery({
    queryKey: ["pets", city],
    queryFn: () => listFn({ data: city.trim() ? { city: city.trim() } : undefined }),
  });
  const { data: meetupData } = useQuery({
    queryKey: ["pet-meetups"],
    queryFn: () => meetupsFn(),
    enabled: authed === true,
  });

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          name: form.name.trim(),
          species: form.species as (typeof SPECIES)[number],
          breed: form.breed.trim() || null,
          age_years: form.age ? Number(form.age) : null,
          city: form.city.trim() || null,
          photo_url: form.photo.trim() || null,
          description: form.desc.trim() || null,
        },
      }),
    onSuccess: () => {
      setForm({ name: "", species: "chien", breed: "", age: "", city: "", photo: "", desc: "" });
      toast.success("Fiche publiée.");
      qc.invalidateQueries({ queryKey: ["pets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Fiche supprimée."); qc.invalidateQueries({ queryKey: ["pets"] }); },
  });

  const ask = useMutation({
    mutationFn: () => askFn({ data: { pet_id: target!.id, owner_id: target!.user_id, message: msg.trim() } }),
    onSuccess: () => { setTarget(null); setMsg(""); toast.success("Demande envoyée."); qc.invalidateQueries({ queryKey: ["pet-meetups"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const respond = useMutation({
    mutationFn: (a: { id: string; status: "accepte" | "refuse" }) => respondFn({ data: a }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pet-meetups"] }),
  });

  const pets = (data?.pets ?? []) as PetRow[];
  const meetups = meetupData?.meetups ?? [];

  return (
    <AppShell>
      <div className="max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
            <PawPrint className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Animaux</h1>
            <p className="text-sm text-muted-foreground">Présente ton compagnon et organise des balades près de chez toi.</p>
          </div>
        </div>

        <Input placeholder="Filtrer par ville" value={city} onChange={(e) => setCity(e.target.value)} />

        {meetups.length > 0 && (
          <Card className="p-4 space-y-2">
            <h2 className="text-sm font-semibold">Mes demandes de rencontre</h2>
            {meetups.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 text-sm border-b last:border-0 py-1.5">
                <div className="min-w-0">
                  <p className="truncate">{m.incoming ? "Reçue" : "Envoyée"} · {m.pet?.name ?? "Animal"} — {m.message}</p>
                  <p className="text-xs text-muted-foreground">{m.status.replace("_", " ")}</p>
                </div>
                {m.incoming && m.status === "en_attente" && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => respond.mutate({ id: m.id, status: "accepte" })}><Check className="size-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => respond.mutate({ id: m.id, status: "refuse" })}><X className="size-4" /></Button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        {authed ? (
          <Card className="p-4 space-y-3">
            <h2 className="text-sm font-semibold">Ajouter mon animal</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Race (optionnel)" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
              <Input type="number" placeholder="Âge (années)" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              <Input placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="Lien photo (https://…)" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
            </div>
            <Textarea rows={3} placeholder="Caractère, habitudes de balade…" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name.trim()}>
              {create.isPending ? "Publication…" : "Publier la fiche"}
            </Button>
          </Card>
        ) : (
          <Card className="p-4 text-sm text-muted-foreground">
            <Link to="/auth" className="text-accent underline">Connecte-toi</Link> pour ajouter ton animal et proposer une rencontre.
          </Card>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {pets.length === 0 && <Card className="p-8 text-center text-muted-foreground sm:col-span-2">Aucun animal publié pour l'instant.</Card>}
          {pets.map((p) => (
            <Card key={p.id} className="p-4 space-y-2">
              {p.photo_url && (
                <img src={p.photo_url} alt={`Photo de ${p.name}`} loading="lazy" className="w-full h-40 object-cover rounded-lg" />
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.species}{p.breed ? ` · ${p.breed}` : ""}{p.age_years != null ? ` · ${p.age_years} ans` : ""}
                  </p>
                </div>
                {p.mine && (
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)}><Trash2 className="size-4 text-destructive" /></Button>
                )}
              </div>
              {p.city && <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3" />{p.city}</p>}
              {p.description && <p className="text-sm">{p.description}</p>}
              {!p.mine && authed && (
                <Button size="sm" variant="outline" onClick={() => setTarget(p)}>Proposer une rencontre</Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rencontre avec {target?.name}</DialogTitle></DialogHeader>
          <Textarea rows={4} placeholder="Bonjour ! On se retrouve au parc samedi matin ?" value={msg} onChange={(e) => setMsg(e.target.value)} />
          <Button onClick={() => ask.mutate()} disabled={ask.isPending || !msg.trim()}>Envoyer la demande</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
