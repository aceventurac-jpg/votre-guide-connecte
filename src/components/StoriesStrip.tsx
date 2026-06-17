import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Clock, Trash2, Plus, BadgeCheck } from "lucide-react";
import { listStories, createStory, deleteStory } from "@/lib/stories.functions";
import { AGENT_META, AGENT_ORDER, type AgentKey } from "@/lib/agent-meta";
import { useIsAuthed } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type Story = {
  id: string;
  user_id: string;
  category: string;
  content: string;
  visibility: string;
  created_at: string;
  expires_at: string;
  author: { id: string; name: string | null; city: string | null; profile_type: string | null } | null;
  mine: boolean;
};

export function StoriesStrip({ category }: { category?: AgentKey }) {
  const listFn = useServerFn(listStories);
  const delFn = useServerFn(deleteStory);
  const qc = useQueryClient();
  const { authed } = useIsAuthed();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Story | null>(null);

  const { data } = useQuery({
    queryKey: ["stories", category ?? "all"],
    queryFn: () => listFn({ data: category && category !== "general" ? { category: category as Exclude<AgentKey, "general"> } : undefined }),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Story supprimée"); qc.invalidateQueries({ queryKey: ["stories"] }); setSelected(null); },
  });

  const stories = (data?.stories ?? []) as Story[];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium flex items-center gap-1.5"><Sparkles className="size-4 text-accent" /> Stories du moment</h2>
        {authed ? (
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}><Plus className="size-3.5 mr-1" /> Story</Button>
        ) : (
          <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground">Connecte-toi pour publier</Link>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {stories.length === 0 && <p className="text-xs text-muted-foreground">Pas encore de story.</p>}
        {stories.map((s) => {
          const meta = AGENT_META[s.category as AgentKey] ?? AGENT_META.general;
          const isPro = s.author?.profile_type === "professionnel";
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="snap-start shrink-0 w-32 rounded-2xl p-3 text-left border transition hover:scale-[1.02]"
              style={{ background: meta.color, borderColor: meta.ring }}
            >
              <div className="flex items-center gap-1 mb-1">
                <meta.icon className="size-3" style={{ color: meta.accent }} />
                <span className="text-[10px] font-medium" style={{ color: meta.accent }}>{meta.label}</span>
                {isPro && <BadgeCheck className="size-3 ml-auto text-primary" />}
              </div>
              <p className="text-xs line-clamp-3 text-foreground/90">{s.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{s.author?.name || "Membre"}</p>
            </button>
          );
        })}
      </div>

      <NewStoryDialog open={open} onOpenChange={setOpen} defaultCategory={category && category !== "general" ? (category as Exclude<AgentKey, "general">) : undefined} />

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (() => {
            const meta = AGENT_META[selected.category as AgentKey] ?? AGENT_META.general;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs" style={{ background: meta.color, color: meta.accent }}>
                      <meta.icon className="size-3" /> {meta.label}
                    </span>
                    {selected.author?.profile_type === "professionnel" && <span className="text-xs inline-flex items-center gap-1 text-primary"><BadgeCheck className="size-3.5" /> Pro</span>}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm whitespace-pre-wrap">{selected.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>{selected.author?.name || "Membre"}{selected.author?.city ? ` · ${selected.author.city}` : ""}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" /> 24h</span>
                </div>
                {selected.mine && (
                  <Button variant="ghost" size="sm" className="text-destructive self-end" onClick={() => del.mutate(selected.id)}>
                    <Trash2 className="size-3.5 mr-1" /> Supprimer
                  </Button>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewStoryDialog({ open, onOpenChange, defaultCategory }: { open: boolean; onOpenChange: (v: boolean) => void; defaultCategory?: Exclude<AgentKey, "general"> }) {
  const [category, setCategory] = useState<Exclude<AgentKey, "general">>(defaultCategory ?? "voyage");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const createFn = useServerFn(createStory);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => createFn({ data: { category, content: content.trim(), visibility } }),
    onSuccess: () => {
      toast.success("Story publiée (24h)");
      setContent("");
      qc.invalidateQueries({ queryKey: ["stories"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Publier une story</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (content.trim()) m.mutate(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Univers</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGENT_ORDER.map((k) => <SelectItem key={k} value={k}>{AGENT_META[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibilité</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Publique</SelectItem>
                  <SelectItem value="private">Privée (seulement moi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Message court</Label>
            <Textarea rows={3} maxLength={500} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Offre du jour, info éclair, conseil rapide..." />
            <p className="text-[10px] text-muted-foreground mt-1">{content.length}/500 · disparaît dans 24h</p>
          </div>
          <Button type="submit" disabled={m.isPending || !content.trim()} className="w-full">Publier</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
