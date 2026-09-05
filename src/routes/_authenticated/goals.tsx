import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { createGoal, listGoals, updateGoalStatus, deleteGoal, updateGoalProgress } from "@/lib/goals.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({ meta: [{ title: "Mes objectifs — Assistant Citoyen" }] }),
  component: GoalsPage,
});

function deadlineBadge(deadline: string | null, status: string) {
  if (status === "atteint") return { label: "Atteint ✅", cls: "bg-green-100 text-green-800" };
  if (status === "abandonne") return { label: "Abandonné", cls: "bg-muted text-muted-foreground" };
  if (!deadline) return { label: "Sans échéance", cls: "bg-muted text-muted-foreground" };
  const diff = Math.floor((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { label: `Dépassé de ${-diff}j`, cls: "bg-red-100 text-red-800" };
  if (diff <= 7) return { label: `Dans ${diff}j`, cls: "bg-orange-100 text-orange-800" };
  return { label: `Dans ${diff}j`, cls: "bg-emerald-100 text-emerald-800" };
}

function GoalsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(listGoals);
  const createFn = useServerFn(createGoal);
  const updateFn = useServerFn(updateGoalStatus);
  const deleteFn = useServerFn(deleteGoal);
  const progressFn = useServerFn(updateGoalProgress);

  const { data } = useQuery({ queryKey: ["goals"], queryFn: () => fetchFn() });
  const goals = data?.goals ?? [];

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const create = useMutation({
    mutationFn: () => createFn({ data: { title: title.trim(), deadline: deadline || null } }),
    onSuccess: () => {
      setTitle(""); setDeadline("");
      toast.success("Objectif créé.");
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (args: { id: string; status: "en_cours" | "atteint" | "abandonne" }) => updateFn({ data: args }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
  const progress = useMutation({
    mutationFn: (a: { id: string; progress: number }) => progressFn({ data: a }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
            <Target className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Mes objectifs</h1>
            <p className="text-sm text-muted-foreground">Fixe une échéance, garde la motivation.</p>
          </div>
        </div>

        <Card className="p-4 space-y-3">
          <Input placeholder="Mon objectif (ex. Apprendre 100 mots d'anglais)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Button onClick={() => create.mutate()} disabled={create.isPending || !title.trim()}>
            {create.isPending ? "Création…" : "Créer l'objectif"}
          </Button>
        </Card>

        <div className="space-y-2">
          {goals.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">Pas encore d'objectif.</Card>
          )}
          {goals.map((g) => {
            const b = deadlineBadge(g.deadline, g.status);
            return (
              <Card key={g.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{g.title}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${b.cls}`}>{b.label}</span>
                </div>
                <div className="flex gap-1">
                  {g.status === "en_cours" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: g.id, status: "atteint" })} title="Atteint">
                        <CheckCircle2 className="size-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: g.id, status: "abandonne" })} title="Abandonner">
                        <XCircle className="size-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(g.id)} title="Supprimer">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
