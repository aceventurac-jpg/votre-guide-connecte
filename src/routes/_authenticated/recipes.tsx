import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Trash2, Share2 } from "lucide-react";
import { createRecipe, listRecipes, deleteRecipe, setRecipeDay } from "@/lib/recipes.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"] as const;
import { createPost } from "@/lib/community.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/recipes")({
  head: () => ({ meta: [{ title: "Mes recettes — Assistant Citoyen" }] }),
  component: RecipesPage,
});

function RecipesPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(listRecipes);
  const createFn = useServerFn(createRecipe);
  const deleteFn = useServerFn(deleteRecipe);
  const dayFn = useServerFn(setRecipeDay);
  const sharePost = useServerFn(createPost);

  const { data } = useQuery({ queryKey: ["recipes"], queryFn: () => fetchFn() });
  const recipes = data?.recipes ?? [];

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [photo, setPhoto] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const ing = ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
      const st = steps.split("\n").map((s) => s.trim()).filter(Boolean);
      if (!title.trim() || ing.length === 0 || st.length === 0) throw new Error("Titre, ingrédients et étapes requis.");
      return createFn({ data: { title: title.trim(), ingredients: ing, steps: st, photo_url: photo.trim() || null } });
    },
    onSuccess: () => {
      setTitle(""); setIngredients(""); setSteps(""); setPhoto("");
      toast.success("Recette enregistrée.");
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setDay = useMutation({
    mutationFn: (a: { id: string; planned_day: string | null }) => dayFn({ data: a }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
  });

  const shopping = Array.from(
    new Set(recipes.filter((r) => r.planned_day).flatMap((r) => r.ingredients.map((i) => i.trim()))),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Supprimée."); qc.invalidateQueries({ queryKey: ["recipes"] }); },
  });

  const share = useMutation({
    mutationFn: async (r: { title: string; ingredients: string[]; steps: string[] }) => {
      const content = `**${r.title}**\n\n**Ingrédients :**\n- ${r.ingredients.join("\n- ")}\n\n**Étapes :**\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      return sharePost({ data: { category: "cuisine", context: "loisirs", content } });
    },
    onSuccess: () => toast.success("Recette partagée dans la Communauté."),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Mes recettes</h1>
            <p className="text-sm text-muted-foreground">Carnet personnel. Partage celles que tu veux dans la Communauté.</p>
          </div>
        </div>

        <Card className="p-4 space-y-3">
          <Input placeholder="Titre de la recette" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            placeholder="Ingrédients (un par ligne)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={5}
          />
          <Textarea
            placeholder="Étapes (une par ligne)"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={6}
          />
          <Input placeholder="Lien photo (optionnel, https://…)" value={photo} onChange={(e) => setPhoto(e.target.value)} />
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? "Enregistrement…" : "Enregistrer la recette"}
          </Button>
        </Card>

        {shopping.length > 0 && (
          <Card className="p-4 space-y-2">
            <h2 className="font-semibold text-sm">Liste de courses de la semaine</h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 text-sm list-disc pl-5">
              {shopping.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </Card>
        )}

        <div className="space-y-3">
          {recipes.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">Pas encore de recette. Ajoute la première !</Card>
          )}
          {recipes.map((r) => (
            <Card key={r.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{r.title}</h2>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => share.mutate(r)} title="Partager">
                    <Share2 className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(r.id)} title="Supprimer">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {r.photo_url && (
                <img src={r.photo_url} alt={`Photo de ${r.title}`} loading="lazy" className="w-full h-40 object-cover rounded-lg" />
              )}
              <Select
                value={r.planned_day ?? "aucun"}
                onValueChange={(v) => setDay.mutate({ id: r.id, planned_day: v === "aucun" ? null : v })}
              >
                <SelectTrigger className="w-48"><SelectValue placeholder="Jour du menu" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun">Pas au menu</SelectItem>
                  {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ingrédients</h3>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {r.ingredients.map((i, k) => <li key={k}>{i}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Étapes</h3>
                  <ol className="list-decimal pl-5 space-y-0.5">
                    {r.steps.map((s, k) => <li key={k}>{s}</li>)}
                  </ol>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
